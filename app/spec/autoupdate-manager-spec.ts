import AutoUpdateManager from '../src/browser/autoupdate-manager';

describe('AutoUpdateManager', function () {
  beforeEach(function () {
    this.mailspringIdentityId = null;
    this.specMode = true;
    this.config = {
      set: jasmine.createSpy('config.set'),
      get: (key) => {
        if (key === 'identity.id') return this.mailspringIdentityId;
        if (key === 'env') return 'production';
        return null;
      },
      onDidChange: jasmine.createSpy('config.onDidChange'),
    };
  });

  it('has no inherited update feed even with an attached commit version', function () {
    const m = new AutoUpdateManager('3.222.1-abc', this.config, this.specMode);
    spyOn(m, 'setupAutoUpdater');
    expect(m.feedURL).toEqual('');
    expect(m.getState()).toBe('unsupported');
  });

  it('has no inherited update feed for an untagged version', function () {
    const m = new AutoUpdateManager('3.222.1', this.config, this.specMode);
    spyOn(m, 'setupAutoUpdater');
    expect(m.feedURL).toEqual('');
  });

  it('never includes a legacy identity in its update destination', function () {
    this.mailspringIdentityId = 'test-mailspring-id';
    const m = new AutoUpdateManager('3.222.1', this.config, this.specMode);
    spyOn(m, 'setupAutoUpdater');
    expect(m.feedURL).toEqual('');
    expect(this.config.onDidChange).not.toHaveBeenCalled();
  });

  it('does not resume upstream traffic when identity settings change', function () {
    const m = new AutoUpdateManager('3.222.1', this.config, this.specMode);
    spyOn(m, 'setupAutoUpdater');
    this.mailspringIdentityId = 'test-mailspring-id';
    m.updateFeedURL();
    expect(m.feedURL).toEqual('');
    expect(m.getState()).toBe('unsupported');
  });

  it('fails safely on manual check and cannot install without an approved feed', function () {
    const m = new AutoUpdateManager('3.222.1', this.config, this.specMode);
    spyOn(m, 'setupAutoUpdater');
    expect(() => m.check()).not.toThrow();
    expect(m.canInstallUpdate()).toBe(false);
    expect(m.install()).toBe(false);
    expect(m.getState()).toBe('unsupported');
  });
});
