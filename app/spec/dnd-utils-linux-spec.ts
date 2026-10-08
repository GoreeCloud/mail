import proxyquire from 'proxyquire';

// ---------------------------------------------------------------------------
// Per-test spy and lazily-loaded module (proxyquire injects the mock before
// the module is evaluated, so the destructured `execFile` binding is mocked).
// ---------------------------------------------------------------------------

let execFileSpy: jasmine.Spy;
let getDoNotDisturb: () => Promise<boolean>;
let clearDoNotDisturbCache: () => void;

function loadModule() {
  execFileSpy = jasmine.createSpy('execFile');
  const mod = proxyquire('../src/dnd-utils-linux', {
    child_process: { execFile: execFileSpy, '@noCallThru': false },
  });
  getDoNotDisturb = mod.getDoNotDisturb;
  clearDoNotDisturbCache = mod.clearDoNotDisturbCache;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockExecFileSuccess(stdout: string) {
  execFileSpy.andCallFake(
    (
      _cmd: string,
      _args: string[],
      _opts: any,
      callback: (err: Error | null, stdout: string) => void
    ) => {
      callback(null, stdout);
    }
  );
}

function mockExecFileError(code = 'ENOENT') {
  execFileSpy.andCallFake(
    (
      _cmd: string,
      _args: string[],
      _opts: any,
      callback: (err: Error | null, stdout: string) => void
    ) => {
      const error = new Error('Command not found') as NodeJS.ErrnoException;
      error.code = code;
      callback(error, '');
    }
  );
}

function mockExecFileByCommand(routes: Record<string, { stdout?: string; error?: boolean }>) {
  execFileSpy.andCallFake(
    (
      cmd: string,
      _args: string[],
      _opts: any,
      callback: (err: Error | null, stdout: string) => void
    ) => {
      const route = routes[cmd];
      if (route && !route.error) {
        callback(null, route.stdout || '');
      } else {
        const error = new Error('Command not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        callback(error, '');
      }
    }
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Linux Do Not Disturb Detection', () => {
  const originalPlatform = process.platform;
  const originalEnv = process.env.XDG_CURRENT_DESKTOP;

  beforeEach(() => {
    loadModule();
    clearDoNotDisturbCache();
    Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    process.env.XDG_CURRENT_DESKTOP = originalEnv;
  });

  describe('freedesktop.org Notifications.Inhibited', () => {
    it('returns true when Inhibited property is true', async () => {
      mockExecFileSuccess(
        'method return time=1234 sender=:1.2 -> destination=:1.3\n   variant       boolean true'
      );
      expect(await getDoNotDisturb()).toBe(true);
    });

    it('returns false when Inhibited property is false', async () => {
      mockExecFileSuccess(
        'method return time=1234 sender=:1.2 -> destination=:1.3\n   variant       boolean false'
      );
      expect(await getDoNotDisturb()).toBe(false);
    });

    it('falls through to DE-specific fallback on unexpected output', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'GNOME';
      mockExecFileByCommand({
        'dbus-send': { stdout: '   variant       uint32 1' },
        gsettings: { stdout: 'false' },
      });
      expect(await getDoNotDisturb()).toBe(true);
    });

    it('calls dbus-send with correct arguments', async () => {
      mockExecFileSuccess('   variant       boolean false');
      await getDoNotDisturb();

      expect(execFileSpy.calls.length).toBe(1);
      const [cmd, args, opts, callback] = execFileSpy.calls[0].args;
      expect(cmd).toEqual('dbus-send');
      expect(args).toEqual([
        '--session',
        '--print-reply',
        '--dest=org.freedesktop.Notifications',
        '/org/freedesktop/Notifications',
        'org.freedesktop.DBus.Properties.Get',
        'string:org.freedesktop.Notifications',
        'string:Inhibited',
      ]);
      expect(typeof opts.timeout).toBe('number');
      expect(typeof callback).toBe('function');
    });
  });

  describe('GNOME gsettings fallback', () => {
    it('returns true when show-banners is false', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'GNOME';
      mockExecFileByCommand({ 'dbus-send': { error: true }, gsettings: { stdout: 'false' } });
      expect(await getDoNotDisturb()).toBe(true);
    });

    it('returns false when show-banners is true', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'GNOME';
      mockExecFileByCommand({ 'dbus-send': { error: true }, gsettings: { stdout: 'true' } });
      expect(await getDoNotDisturb()).toBe(false);
    });

    it('works with ubuntu:GNOME desktop identifier', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'ubuntu:GNOME';
      mockExecFileByCommand({ 'dbus-send': { error: true }, gsettings: { stdout: 'false' } });
      expect(await getDoNotDisturb()).toBe(true);
    });

    it('works with pop:GNOME desktop identifier', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'pop:GNOME';
      mockExecFileByCommand({ 'dbus-send': { error: true }, gsettings: { stdout: 'false' } });
      expect(await getDoNotDisturb()).toBe(true);
    });

    it('works with Budgie:GNOME desktop identifier', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'Budgie:GNOME';
      mockExecFileByCommand({ 'dbus-send': { error: true }, gsettings: { stdout: 'false' } });
      expect(await getDoNotDisturb()).toBe(true);
    });
  });

  describe('Cinnamon gsettings fallback', () => {
    it('returns true when display-notifications is false', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'X-Cinnamon';
      mockExecFileByCommand({ 'dbus-send': { error: true }, gsettings: { stdout: 'false' } });
      expect(await getDoNotDisturb()).toBe(true);
    });

    it('returns false when display-notifications is true', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'X-Cinnamon';
      mockExecFileByCommand({ 'dbus-send': { error: true }, gsettings: { stdout: 'true' } });
      expect(await getDoNotDisturb()).toBe(false);
    });
  });

  describe('XFCE xfconf-query fallback', () => {
    it('returns true when do-not-disturb is true', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'XFCE';
      mockExecFileByCommand({ 'dbus-send': { error: true }, 'xfconf-query': { stdout: 'true' } });
      expect(await getDoNotDisturb()).toBe(true);
    });

    it('returns false when do-not-disturb is false', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'XFCE';
      mockExecFileByCommand({ 'dbus-send': { error: true }, 'xfconf-query': { stdout: 'false' } });
      expect(await getDoNotDisturb()).toBe(false);
    });

    it('handles case-insensitive True response', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'XFCE';
      mockExecFileByCommand({ 'dbus-send': { error: true }, 'xfconf-query': { stdout: 'True' } });
      expect(await getDoNotDisturb()).toBe(true);
    });
  });

  describe('unrecognized desktop environments', () => {
    it('returns false for MATE (no built-in DND)', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'MATE';
      mockExecFileError();
      expect(await getDoNotDisturb()).toBe(false);
    });

    it('returns false for LXQt (no built-in DND)', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'LXQt';
      mockExecFileError();
      expect(await getDoNotDisturb()).toBe(false);
    });

    it('returns false when XDG_CURRENT_DESKTOP is unset', async () => {
      delete process.env.XDG_CURRENT_DESKTOP;
      mockExecFileError();
      expect(await getDoNotDisturb()).toBe(false);
    });
  });

  describe('caching', () => {
    it('returns cached result without spawning a process on second call', async () => {
      mockExecFileSuccess('   variant       boolean true');
      expect(await getDoNotDisturb()).toBe(true);
      expect(execFileSpy.calls.length).toBe(1);

      expect(await getDoNotDisturb()).toBe(true);
      expect(execFileSpy.calls.length).toBe(1);
    });

    it('refreshes after cache is cleared', async () => {
      mockExecFileSuccess('   variant       boolean true');
      expect(await getDoNotDisturb()).toBe(true);
      expect(execFileSpy.calls.length).toBe(1);

      clearDoNotDisturbCache();
      mockExecFileSuccess('   variant       boolean false');
      expect(await getDoNotDisturb()).toBe(false);
      expect(execFileSpy.calls.length).toBe(2);
    });
  });

  describe('error resilience', () => {
    it('returns false when all detection methods fail', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'GNOME';
      mockExecFileError();
      expect(await getDoNotDisturb()).toBe(false);
    });

    it('returns false when dbus-send is not installed', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'KDE';
      mockExecFileError('ENOENT');
      expect(await getDoNotDisturb()).toBe(false);
    });

    it('prefers freedesktop standard over DE-specific method', async () => {
      process.env.XDG_CURRENT_DESKTOP = 'GNOME';
      mockExecFileSuccess('   variant       boolean false');
      expect(await getDoNotDisturb()).toBe(false);
      expect(execFileSpy.calls.length).toBe(1);
      expect(execFileSpy.calls[0].args[0]).toBe('dbus-send');
    });
  });
});
