import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import Webview, { InitialLoadingCover } from '../../src/components/webview';

describe('Webview sign-in security', () => {
  afterEach(cleanup);

  const newComponent = () => {
    const component = new Webview({ src: 'https://identity.example.test' });
    component._mounted = true;
    spyOn(component, 'setState');
    return component;
  };

  it('denies every popup request instead of launching an external URL', () => {
    const component = newComponent();
    for (const url of [
      'https://example.test/signin',
      'http://example.test',
      'file:///etc/passwd',
      'javascript:alert(1)',
    ]) {
      const event = { url, preventDefault: jasmine.createSpy('preventDefault') };
      component._onNewWindow(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.setState).toHaveBeenCalled();
    }
  });


  it('explains blocked guest popups without exposing the requested destination', () => {
    const component = newComponent();
    const url = 'https://identity.example.test/redirect?code=private-code';
    component._onNewWindow({ preventDefault: jasmine.createSpy('preventDefault') });
    const state = (component.setState as jasmine.Spy).calls[0].args[0];
    expect(state.ready).toBe(false);
    expect(state.error).toContain('blocked');
    expect(state.error).not.toContain(url);
    expect(state.webviewLoading).toBe(false);
  });

  it('renders an accessible retry button and announces sign-in failures', () => {
    const retry = jasmine.createSpy('retry');
    const { getByRole } = render(
      React.createElement(InitialLoadingCover, { error: "Unable to connect", onTryAgain: retry })
    );
    expect(getByRole('alert').textContent).toContain('Unable to connect');
    const button = getByRole('button');
    expect((button as HTMLButtonElement).disabled).toBe(false);
    expect(button.textContent).toContain('Try Again');
    fireEvent.click(button);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('keeps inactive recovery controls out of the keyboard tab order', () => {
    const props = { ready: false, onTryAgain: () => {} };
    const { container, rerender } = render(React.createElement(InitialLoadingCover, props));
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(container.querySelector('.webview-cover').getAttribute('aria-hidden')).toBe('false');

    rerender(React.createElement(InitialLoadingCover, { ...props, ready: true }));
    expect(button.disabled).toBe(true);
    expect(container.querySelector('.webview-cover').getAttribute('aria-hidden')).toBe('true');
  });

  it('does not attach guest console handlers and keeps listener identities stable', () => {
    const component = newComponent();
    const first = component._webviewListeners();
    const second = component._webviewListeners();
    expect(first['new-window']).toBe(second['new-window']);
    expect(first['did-navigate']).toBe(second['did-navigate']);
    expect(Object.keys(first)).not.toContain('console-message');
  });

  it('keeps the sign-in error visible after an HTTP failure without exposing its URL', () => {
    const component = newComponent();
    const secretUrl = 'https://identity.example.test/callback?access_token=do-not-display';
    component._webviewDidFrameNavigate({
      url: secretUrl,
      httpResponseCode: 403,
      httpStatusText: 'Forbidden',
      isMainFrame: true,
    });
    expect(component.setState).toHaveBeenCalledTimes(1);
    const state = (component.setState as jasmine.Spy).calls[0].args[0];
    expect(state.ready).toBe(false);
    expect(state.error).toContain('403');
    expect(state.error).not.toContain(secretUrl);
    expect(state.webviewLoading).toBe(false);
  });

  it('marks a successful main-frame navigation ready and clears a prior error', () => {
    const component = newComponent();
    component._webviewDidFrameNavigate({
      url: 'https://identity.example.test',
      httpResponseCode: 200,
      httpStatusText: 'OK',
      isMainFrame: true,
    });
    expect(component.setState).toHaveBeenCalledWith({
      ready: true,
      error: null,
      webviewLoading: false,
    });
  });

  it('ignores subframe failures and aborted loads', () => {
    const component = newComponent();
    component._webviewDidFrameNavigate({
      url: 'https://identity.example.test/hidden',
      httpResponseCode: 404,
      httpStatusText: 'Not Found',
      isMainFrame: false,
    });
    component._webviewDidFailLoad({ errorCode: -3 });
    expect(component.setState).not.toHaveBeenCalled();
  });
});
