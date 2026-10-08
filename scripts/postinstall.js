#!/usr/bin/env node
/* eslint global-require: 0 */
/* eslint quote-props: 0 */
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { pipeline } = require('stream');
const fs = require('fs');
const rimraf = require('rimraf');
const targz = require('targz');
const { safeExec } = require('./utils/child-process-wrapper.js');
const { execSync } = require('child_process');

const appDependencies = require('../app/package.json').dependencies;
const rootDependencies = require('../package.json').dependencies;
const npmElectronTarget = rootDependencies.electron;
const npmEnvs = {
  system: process.env,
  electron: Object.assign({}, process.env, {
    npm_config_target: npmElectronTarget,
    npm_config_arch: process.env.OVERRIDE_TO_INTEL ? 'x64' : process.arch,
    npm_config_target_arch: process.env.OVERRIDE_TO_INTEL ? 'x64' : process.arch,
    npm_config_disturl: 'https://electronjs.org/headers',
    npm_config_runtime: 'electron',
  }),
};

function npm(cmd, options) {
  const { cwd, env } = Object.assign({ cwd: '.', env: 'system' }, options);

  return new Promise((resolve, reject) => {
    console.log(
      `\n-- Running npm ${cmd} in ${cwd} with ${env} config (arch=${npmEnvs[env].npm_config_target_arch}) --`
    );

    safeExec(
      `npm ${cmd}`,
      {
        cwd: path.resolve(__dirname, '..', cwd),
        env: npmEnvs[env],
      },
      (err, stdout) => {
        return err ? reject(err) : resolve(stdout);
      }
    );
  });
}

function getMailsyncURL(callback) {
  const distKey = `${process.platform}-${process.arch}`;
  const distDir = {
    'darwin-x64': 'osx',
    'darwin-arm64': 'osx',
    'win32-x64': 'win-ia32', // At this time, Mailsync is still 32-bit
    'win32-ia32': 'win-ia32',
    'linux-x64': 'linux',
    'linux-arm64': 'linux-arm64',
    'linux-ia32': null,
  }[distKey];

  if (!distDir) {
    console.error(
      `\nSorry, a Mailspring Mailsync build for your machine (${distKey}) is not yet available.`
    );
    return;
  }

  const out = execSync('git submodule status ./mailsync');
  const [_, hash] = /[\+-]([A-Za-z0-9]{8})/.exec(out.toString());
  callback(
    `https://mailspring-builds.s3.amazonaws.com/mailsync/${hash}/${distDir}/mailsync.tar.gz`
  );
}

function downloadMailsync() {
  return new Promise((resolve, reject) => {
    try {
      getMailsyncURL(distS3URL => {
        const archivePath = path.resolve(__dirname, '..', 'app', 'mailsync.tar.gz');
        const temporaryPath = `${archivePath}.${process.pid}.partial`;
        const expected = process.env.GOREECLOUD_MAIL_MAILSYNC_SHA256;
        const releaseMode = process.env.GOREECLOUD_MAIL_RELEASE_MODE === '1';
        let settled = false;

        const fail = error => {
          if (settled) return;
          settled = true;
          try { fs.unlinkSync(temporaryPath); } catch (_) {}
          reject(error);
        };

        if (releaseMode && !expected) {
          fail(new Error('Production Mailsync download requires a pinned SHA-256 digest.'));
          return;
        }
        if (expected && !/^[0-9a-f]{64}$/i.test(expected)) {
          fail(new Error('Invalid Mailsync SHA-256 digest configuration.'));
          return;
        }

        const request = https.get(distS3URL, response => {
          if (response.statusCode !== 200) {
            response.resume();
            fail(new Error(`Mailsync archive fetch failed with HTTP ${response.statusCode}.`));
            return;
          }

          const digest = crypto.createHash('sha256');
          let bytes = 0;
          response.on('data', chunk => {
            bytes += chunk.length;
            if (bytes > 250 * 1024 * 1024) {
              response.destroy(new Error('Mailsync archive exceeds download size limit.'));
              return;
            }
            digest.update(chunk);
          });

          const output = fs.createWriteStream(temporaryPath, { flags: 'wx' });
          pipeline(response, output, err => {
            if (err) {
              fail(err);
              return;
            }

            const actual = digest.digest('hex');
            if (expected && !crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'))) {
              fail(new Error('Mailsync archive digest mismatch.'));
              return;
            }

            try {
              fs.renameSync(temporaryPath, archivePath);
            } catch (error) {
              fail(error);
              return;
            }

            // Archive extraction and platform-specific verification are separate
            // release gates. An upstream archive is never production-approved
            // solely because this development download completed.
            targz.decompress({ src: archivePath, dest: path.dirname(archivePath) }, err => {
              if (err) {
                fail(err);
                return;
              }
              settled = true;
              console.log('Downloaded and extracted Mailsync development archive.');
              resolve();
            });
          });
        });
        request.on('error', fail);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// For speed, we cache app/node_modules. However, we need to
// be sure to do a full rebuild of native node modules when the
// Electron version changes. To do this we check a marker file.
const appPath = path.resolve(__dirname, '..', 'app');
const appModulesPath = path.resolve(appPath, 'node_modules');
const cacheVersionPath = path.join(appModulesPath, '.postinstall-target-version');
const cacheElectronTarget =
  fs.existsSync(cacheVersionPath) && fs.readFileSync(cacheVersionPath).toString();

if (cacheElectronTarget !== npmElectronTarget) {
  console.log(
    `\n-- Clearing app/node_modules (${cacheElectronTarget} !== ${npmElectronTarget}) --`
  );
  rimraf.sync(appModulesPath);
}

// Audit is emitted with npm ls, no need to run it on EVERY command which is an odd default

async function sqliteMissingNanosleep() {
  return new Promise(resolve => {
    const sqliteLibDir = path.join(appModulesPath, 'better-sqlite3', 'build', 'Release');
    const staticLib = path.join(sqliteLibDir, 'sqlite3.a');
    const sharedLib = path.join(sqliteLibDir, 'better_sqlite3.node');

    // Check the static lib first (build-from-source), then the prebuilt .node binary
    const target = fs.existsSync(staticLib) ? staticLib : sharedLib;
    safeExec(`nm '${target}' | grep nanosleep`, { ignoreStderr: true }, (err, resp) => {
      resolve(resp === '');
    });
  });
}

async function run() {
  // run `npm install` in ./app with Electron NPM config
  await npm(`install --no-audit`, { cwd: './app', env: 'electron' });

  // run `npm dedupe` in ./app with Electron NPM config
  await npm(`dedupe --no-audit`, { cwd: './app', env: 'electron' });

  // run `npm ls` in ./app - detects missing peer dependencies, etc.
  await npm(`ls`, { cwd: './app', env: 'electron' });

  // if SQlite was not built with HAVE_NANOSLEEP, do not ship this build! We need nanosleep
  // support so that multiple processes can connect to the sqlite file at the same time.
  // Without it, transactions only retry every 1 sec instead of every 10ms, leading to
  // awful db lock contention.  https://github.com/WiseLibs/better-sqlite3/issues/597
  if (['linux', 'darwin'].includes(process.platform) && (await sqliteMissingNanosleep())) {
    console.error(`better-sqlite compiled without -HAVE_NANOSLEEP, do not ship this build!`);
    process.exit(1001);
  }

  // write the marker with the electron version
  fs.writeFileSync(cacheVersionPath, npmElectronTarget);

  // if the user hasn't cloned the mailsync module, download
  // the binary for their operating system that was shipped to S3.
  if (!fs.existsSync('./mailsync/build.sh')) {
    console.log(`\n-- Downloading the last released version of Mailspring mailsync --`);
    await downloadMailsync();
  } else {
    console.log(
      `\n-- You have the Mailspring mailsync submodule. If you'd prefer ` +
        `to develop with a pre-built binary, remove the submodule and re-run ` +
        `'npm run postinstall' to download the latest binary for your machine. --`
    );
  }
}

run();
