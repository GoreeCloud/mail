import { render, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { AccountStore, Account, Actions, MailRulesStore } from 'mailspring-exports';
import DisabledMailRulesNotification from '../lib/items/disabled-mail-rules-notif';

describe('DisabledMailRulesNotification', function DisabledMailRulesNotifTests() {
  afterEach(cleanup);

  beforeEach(() => {
    spyOn(AccountStore, 'accounts').andReturn([
      new Account({ id: 'A', syncState: Account.SYNC_STATE_OK, emailAddress: '123@gmail.com' }),
    ]);
  });

  describe('When there is one disabled mail rule', () => {
    let container;
    beforeEach(() => {
      spyOn(MailRulesStore, 'disabledRules').andReturn([{ accountId: 'A' }]);
      ({ container } = render(<DisabledMailRulesNotification />));
    });
    it('displays a notification', () => {
      expect(container.querySelector('.notification') !== null).toEqual(true);
    });

    it('allows users to open the preferences', () => {
      spyOn(Actions, 'switchPreferencesTab');
      spyOn(Actions, 'openPreferences');
      fireEvent.click(container.querySelector('#action-0'));
      expect(Actions.switchPreferencesTab).toHaveBeenCalledWith('Mail Rules', { accountId: 'A' });
      expect(Actions.openPreferences).toHaveBeenCalled();
    });
  });

  describe('When there are multiple disabled mail rules', () => {
    let container;
    beforeEach(() => {
      spyOn(MailRulesStore, 'disabledRules').andReturn([{ accountId: 'A' }, { accountId: 'A' }]);
      ({ container } = render(<DisabledMailRulesNotification />));
    });
    it('displays a notification', () => {
      expect(container.querySelector('.notification') !== null).toEqual(true);
    });

    it('allows users to open the preferences', () => {
      spyOn(Actions, 'switchPreferencesTab');
      spyOn(Actions, 'openPreferences');
      fireEvent.click(container.querySelector('#action-0'));
      expect(Actions.switchPreferencesTab).toHaveBeenCalledWith('Mail Rules', { accountId: 'A' });
      expect(Actions.openPreferences).toHaveBeenCalled();
    });
  });

  describe('When there are no disabled mail rules', () => {
    let container;
    beforeEach(() => {
      spyOn(MailRulesStore, 'disabledRules').andReturn([]);
      ({ container } = render(<DisabledMailRulesNotification />));
    });
    it('does not display a notification', () => {
      expect(container.querySelector('.notification') !== null).toEqual(false);
    });
  });
});
