import ReactDOM from 'react-dom';
import _ from 'underscore';
import { EventedIFrame } from '../../src/components/evented-iframe';

describe('Message link protocol policy', () => {
  const frame = new EventedIFrame({});

  it('permits common navigation destinations', () => {
    for (const href of ['https://example.test', 'http://example.test', 'mailto:a@example.test', 'tel:5551234', '//example.test', 'example.test']) {
      expect(frame._isBlacklistedHref(href)).toBe(false);
    }
  });

  it('rejects unapproved explicit schemes', () => {
    for (const href of ['custom:example', 'about:blank', 'data:text/plain,sample', 'file:///sample']) {
      expect(frame._isBlacklistedHref(href)).toBe(true);
    }
  });

  it('rejects invalid or padded destinations', () => {
    for (const href of ['', ' https://example.test', 'https://example.test ', 'http://example.test\nnext']) {
      expect(frame._isBlacklistedHref(href)).toBe(true);
    }
  });
});

describe('Message iframe listener lifecycle', () => {
  it('does not subscribe when the document is inaccessible', () => {
    let deferred: () => void = () => {};
    spyOn(_, 'defer').andCallFake((callback: () => void) => {
      deferred = callback;
      return 0 as any;
    });
    spyOn(ReactDOM, 'findDOMNode').andReturn({
      contentDocument: null,
      contentWindow: null,
    } as any);

    const frame = new EventedIFrame({});
    frame._subscribeToIFrameEvents();
    expect(() => deferred()).not.toThrow();
  });

  it('does not attach listeners after an iframe is torn down', () => {
    let deferred: () => void = () => {};
    const doc = {
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    };
    spyOn(_, 'defer').andCallFake((callback: () => void) => {
      deferred = callback;
      return 0 as any;
    });
    spyOn(ReactDOM, 'findDOMNode').andReturn({
      contentDocument: doc,
      contentWindow: null,
    } as any);

    const frame = new EventedIFrame({});
    frame._subscribeToIFrameEvents();
    frame._unsubscribeFromIFrameEvents();
    deferred();

    expect(doc.addEventListener).not.toHaveBeenCalled();
    expect(doc.removeEventListener).toHaveBeenCalled();
  });

  it('attaches only the latest deferred subscription when the frame is replaced', () => {
    const deferred: Array<() => void> = [];
    const doc = {
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    };
    spyOn(_, 'defer').andCallFake((callback: () => void) => {
      deferred.push(callback);
      return 0 as any;
    });
    spyOn(ReactDOM, 'findDOMNode').andReturn({
      contentDocument: doc,
      contentWindow: null,
    } as any);

    const frame = new EventedIFrame({});
    frame._subscribeToIFrameEvents();
    frame._unsubscribeFromIFrameEvents();
    frame._subscribeToIFrameEvents();
    deferred.forEach((callback) => callback());

    expect(doc.addEventListener).toHaveBeenCalledTimes(8);
  });
});
