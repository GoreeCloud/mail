import { render, cleanup } from '@testing-library/react';
import React from 'react';
import DevModeNotification from '../lib/items/dev-mode-notif';

describe('DevModeNotif', function DevModeNotifTests() {
  afterEach(cleanup);

  describe('When the window is in dev mode', () => {
    it('displays a notification', () => {
      spyOn(AppEnv, 'inDevMode').andReturn(true);
      const { container } = render(<DevModeNotification />);
      expect(container.querySelector('.notification') !== null).toEqual(true);
    });
  });

  describe('When the window is not in dev mode', () => {
    it("doesn't display a notification", () => {
      spyOn(AppEnv, 'inDevMode').andReturn(false);
      const { container } = render(<DevModeNotification />);
      expect(container.querySelector('.notification') !== null).toEqual(false);
    });
  });
});
