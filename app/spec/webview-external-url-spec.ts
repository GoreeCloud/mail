import Webview from '../src/components/webview';

describe('Onboarding guest popup security', () => {
  it('blocks every external guest popup request', () => {
    const component = new Webview({ src: 'https://identity.example.test' });
    component._mounted = true;
    spyOn(component, 'setState');

    for (const url of [
      'https://example.org',
      'http://example.org',
      'file:///tmp/file.txt',
      'javascript:alert(1)',
    ]) {
      const preventDefault = jasmine.createSpy('preventDefault');
      component._onNewWindow({ preventDefault, url } as any);
      expect(preventDefault).toHaveBeenCalled();
      expect(component.setState).toHaveBeenCalled();
    }
  });

  it('does not leak rejected destination details', () => {
    const component = new Webview({ src: 'https://identity.example.test' });
    component._mounted = true;
    spyOn(component, 'setState');
    component._onNewWindow({
      preventDefault: jasmine.createSpy('preventDefault'),
      url: 'https://example.org/auth?code=private',
    } as any);

    const state = (component.setState as jasmine.Spy).calls[0].args[0];
    expect(state.ready).toBe(false);
    expect(state.error).toContain('blocked');
    expect(state.error).not.toContain('private');
  });
});
