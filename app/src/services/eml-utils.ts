import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import _ from 'underscore';

import {
  Actions,
  DatabaseStore,
  Message,
  TaskQueue,
  GetMessageRFC2822Task,
} from 'mailspring-exports';

/**
 * Generate a safe default .eml filename from a message subject.
 *
 * This is only used for save-dialog defaults and temp filenames on the client.
 * The backend (GetManyRFC2822Task) owns the more complex indexed filename
 * format used during bulk folder export.
 */
export function defaultEmlFilename(subject: string): string {
  let name = (subject || '').trim();
  if (name.length === 0) {
    name = 'untitled';
  }
  // Never split a surrogate pair at the truncation boundary.
  name = Array.from(name).slice(0, 80).join('');
  name = name.replace(/[/?<>\\:*|"]/g, '_');
  // Strip control characters and Unicode direction overrides from untrusted subjects.
  /* eslint-disable no-control-regex */
  name = name.replace(
    /[\u0000-\u001f\u007f-\u009f\u061c\u200e-\u200f\u2028-\u202e\u2066-\u206f]/g,
    ''
  );
  /* eslint-enable no-control-regex */
  name = name.replace(/[.\s]+$/, '');
  if (!name) {
    name = 'untitled';
  }
  // Windows device names stay reserved even when a file extension is appended.
  if (/^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?: *\.|$)/i.test(name)) {
    name = 'file-' + name;
  }
  return `${name}.eml`;
}

export interface StagedEml {
  message: Message;
  filePath: string;
}

/**
 * Resolve the message that represents each of the given threads for the
 * purposes of .eml export.
 *
 * .eml holds a single RFC2822 message, so a thread has to be narrowed to one.
 * Everywhere in the app we use the same convention: the most recent message in
 * the thread. Drafts are skipped — they only exist locally, so the sync engine
 * has no raw source to hand back for them.
 *
 * Threads with no exportable message are omitted, so the result may be shorter
 * than `threadIds`.
 */
export async function newestExportableMessagesForThreadIds(
  threadIds: string[]
): Promise<Message[]> {
  if (!threadIds.length) {
    return [];
  }
  const messages = await Promise.all(
    threadIds.map(async (threadId) => {
      const found = await DatabaseStore.findAll<Message>(Message, { threadId, draft: false })
        .order(Message.attributes.date.descending())
        .limit(1);
      return found.length ? found[0] : null;
    })
  );
  return messages.filter((m) => m !== null);
}

/**
 * Ask the sync engine for the raw RFC2822 source of each message and write it
 * to a temporary .eml file on disk.
 *
 * Each message is staged into its own randomly named subdirectory so that
 * concurrent stages of the same message can't overwrite one another, and so
 * that the file basename can be a clean, human-readable name (it becomes the
 * attachment's display name when the file is attached to a draft). By default
 * the name comes from the subject; pass `filename` to override it.
 *
 * The fetch is remote, so it may fail — and a GetMessageRFC2822Task can reach
 * `complete` without having written anything. Messages whose file never
 * appeared are omitted from the result, so callers should compare the returned
 * length against what they passed in to detect partial failures.
 */
export async function stageMessagesAsEml(
  messages: Message[],
  { filename }: { filename?: string } = {}
): Promise<StagedEml[]> {
  if (!messages.length) {
    return [];
  }

  const staged = messages.map((message) => {
    // IDs originate in provider-backed message records and are not safe path segments.
    // A random directory also avoids exposing message identifiers in temp paths.
    const dir = path.join(
      os.tmpdir(),
      `${STAGING_DIR_PREFIX}${crypto.randomBytes(12).toString('hex')}`
    );
    const basename = filename
      ? defaultEmlFilename(filename.replace(/\.eml$/i, ''))
      : defaultEmlFilename(message.subject);
    return { message, dir, filePath: path.join(dir, basename) };
  });

  // Queue every fetch before awaiting any of them so a multi-message stage
  // isn't serialized on the sync engine's round trips.
  const queuedTasks: GetMessageRFC2822Task[] = [];
  const createdDirs: string[] = [];
  let allQueued = false;
  try {
    staged.forEach(({ message, dir, filePath }) => {
      // Fail closed on a collision; private RFC2822 sources must never be
      // readable through a shared temporary directory.
      fs.mkdirSync(dir, { mode: 0o700 });
      ownedPaths.set(path.resolve(dir), path.resolve(filePath));
      createdDirs.push(dir);
      const task = new GetMessageRFC2822Task({
        messageId: message.id,
        accountId: message.accountId,
        filepath: filePath,
      });
      Actions.queueTask(task);
      queuedTasks.push(task);
    });
    allQueued = true;

    const results = await Promise.all(
      queuedTasks.map(async (task) => {
        try {
          await TaskQueue.waitForPerformRemote(task);
          return { failed: false, error: null };
        } catch (error) {
          return { failed: true, error };
        }
      })
    );
    const failure = results.find((result) => result.failed);
    if (failure) {
      throw failure.error;
    }
  } catch (err) {
    if (!allQueued) {
      // If a later submission throws, earlier queued tasks can still write.
      // Wait for those remote fetches before deleting their staging paths.
      await Promise.all(
        queuedTasks.map(async (task) => {
          try {
            await TaskQueue.waitForPerformRemote(task);
          } catch (ignored) {
            // A failed fetch still needs its directory removed.
          }
        })
      );
    }
    // Never delete a preexisting directory after mkdirSync fails on a collision.
    createdDirs.forEach(removeStagingDirectory);
    throw err;
  }

  // Directories whose file never arrived are dead weight — drop them now, and
  // leave the rest to discardStagedEml once the caller is done with the file.
  const [written, missing] = _.partition(staged, ({ filePath }) => {
    try {
      // A native fetch can complete without a valid RFC2822 file. Do not
      // follow symlinks into unrelated files or export empty placeholder data.
      const info = fs.lstatSync(filePath);
      return info.isFile() && info.size > 0;
    } catch (ignored) {
      return false;
    }
  });
  missing.forEach(({ dir }) => removeStagingDirectory(dir));

  return written.map(({ message, filePath }) => ({ message, filePath }));
}

/**
 * Stage a single message, returning null if its source couldn't be fetched.
 */
export async function stageMessageAsEml(
  message: Message,
  options: { filename?: string } = {}
): Promise<StagedEml | null> {
  const [staged] = await stageMessagesAsEml([message], options);
  return staged || null;
}

/**
 * Stage the message that represents a single thread, returning null if the
 * thread has nothing exportable in it or its source couldn't be fetched.
 */
export async function stageThreadAsEml(
  threadId: string,
  options: { filename?: string } = {}
): Promise<StagedEml | null> {
  const [message] = await newestExportableMessagesForThreadIds([threadId]);
  return message ? stageMessageAsEml(message, options) : null;
}

/**
 * Delete a file produced by stageMessagesAsEml, along with the staging
 * directory it lives in.
 *
 * Staged files are consumed by copying them somewhere permanent — attaching
 * one to a draft copies it into the attachment store — so the temporary copy
 * is garbage the moment the caller is finished with it. Callers should invoke
 * this once that's true (for attachments, from `addAttachment`'s `onCreated`).
 * Failures are ignored: leaving a file behind in the temp directory is not
 * worth interrupting the user over.
 */
export function discardStagedEml(filePath: string) {
  const dir = path.resolve(path.dirname(filePath));
  if (ownedPaths.get(dir) === path.resolve(filePath)) removeStagingDirectory(dir);
}

const STAGING_DIR_PREFIX = 'mailspring-eml-';
const ownedPaths = new Map<string, string>();

function removeStagingDirectory(dir: string) {
  // Guard against deleting anything we didn't create ourselves — callers hand
  // us paths, and a wrong one shouldn't take a real directory with it.
  const resolved = path.resolve(dir);
  if (
    path.dirname(resolved) !== path.resolve(os.tmpdir()) ||
    !/^mailspring-eml-[a-f0-9]{24}$/.test(path.basename(resolved)) ||
    !ownedPaths.has(resolved)
  ) {
    return;
  }
  ownedPaths.delete(resolved);
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    // best effort
  }
}

export interface StagedThreads {
  staged: StagedEml[];
  /**
   * Threads that hold nothing exportable — a conversation containing only
   * unsent drafts, say. Nothing was fetched for these, so they're a distinct
   * outcome from a fetch that was attempted and failed.
   */
  unavailableThreadIds: string[];
}

/**
 * Convenience wrapper over the two steps above: turn a set of thread ids into
 * staged .eml files ready to be attached to a draft.
 */
export async function stageThreadsAsEml(threadIds: string[]): Promise<StagedThreads> {
  const messages = await newestExportableMessagesForThreadIds(threadIds);
  const unavailableThreadIds = threadIds.filter((id) => !messages.some((m) => m.threadId === id));
  return { staged: await stageMessagesAsEml(messages), unavailableThreadIds };
}
