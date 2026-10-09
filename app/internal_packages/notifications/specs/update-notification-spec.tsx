import { render, fireEvent, cleanup } from '@testing-library/react';
import proxyquire from 'proxyquire';
import React from 'react';

let stubUpdaterState = null;
let stubUpdaterReleaseVersion = null;
let ipcSendArgs = null;

const patched = proxyquire('../lib/items/update-notification', {
  electron: {
    ipcRenderer: {
      send: (...args) => {
        ipcSendArgs = args;
      },
    },
  },
  '@electron/remote': {
    getGlobal: () => ({
      autoUpdateManager: {
        get releaseVersion() {
          return stubUpdaterReleaseVersion;
        },
        getState: () => stubUpdaterState,
        getReleaseDetails: () => ({
          releaseVersion: stubUpdaterReleaseVersion,
          releaseNotes: 'A new version is available!',
        }),
      },
    }),
  },
});

const UpdateNotification = patched.default;

describe('UpdateNotification', function describeBlock() {
  afterEach(cleanup);

  beforeEach(() => {
    stubUpdaterState = 'idle';
    stubUpdaterReleaseVersion = undefined;
    ipcSendArgs = null;
  });

  describe('mounting', () => {
    it('should display a notification immediately if one is available', () => {
      stubUpdaterState = 'update-available';
      const { container } = render(<UpdateNotification />);
      expect(container.querySelector('.notification') !== null).toEqual(true);
    });

    it('should not display a notification if no update is avialable', () => {
      stubUpdaterState = 'no-update-available';
      const { container } = render(<UpdateNotification />);
      expect(container.querySelector('.notification') !== null).toEqual(false);
    });

    it('should listen for `window:update-available`', () => {
      spyOn(AppEnv, 'onUpdateAvailable').andCallThrough();
      render(<UpdateNotification />);
      expect(AppEnv.onUpdateAvailable).toHaveBeenCalled();
    });
  });

  describe('displayNotification', () => {
    it('should include the version if one is provided', () => {
      stubUpdaterState = 'update-available';
      stubUpdaterReleaseVersion = '0.515.0-123123';
      const { container } = render(<UpdateNotification />);
      expect(container.querySelector('.title').textContent.indexOf('0.515.0-123123') >= 0).toBe(
        true
      );
    });

    describe('when the action is taken', () => {
      it('should fire the `application:install-update` IPC event', () => {
        stubUpdaterState = 'update-available';
        const { container } = render(<UpdateNotification />);
        fireEvent.click(container.querySelector('#action-0'));
        expect(ipcSendArgs).toEqual(['command', 'application:install-update']);
      });

      it('should dismiss the update notification prompt', () => {
        stubUpdaterState = 'update-available';
        const { container } = render(<UpdateNotification />);
        expect(container.querySelector('.notification') !== null).toEqual(true);
        fireEvent.click(container.querySelector('#action-1'));
        expect(container.querySelector('.notification') !== null).toEqual(false);
      });
    });
  });
});
