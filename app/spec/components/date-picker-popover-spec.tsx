import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { DateUtils } from 'mailspring-exports';
import { DatePickerPopover } from 'mailspring-component-kit';

const makePopover = (props = {}) => {
  return render(
    <DatePickerPopover
      dateOptions={{}}
      header={<span className="header">my header</span>}
      onSelectDate={() => {}}
      {...props}
    />
  );
};

describe('DatePickerPopover', function sendLaterPopover() {
  afterEach(cleanup);

  beforeEach(() => {
    spyOn(DateUtils, 'format').andReturn('formatted');
  });

  describe('selectDate', () => {
    it('calls props.onSelectDate when a date option item is clicked', () => {
      const onSelectDate = jasmine.createSpy('onSelectDate');
      const fakeDate = new Date();
      const { container } = makePopover({
        onSelectDate,
        dateOptions: {
          'My Option': () => fakeDate,
        },
      });
      const item = container.querySelector('.item');
      fireEvent.mouseDown(item);
      expect(onSelectDate).toHaveBeenCalledWith(fakeDate, 'My Option');
    });
  });

  describe('onSelectMenuOption', () => {});

  describe('onCustomDateSelected', () => {
    it('selects date when a valid date is submitted via DateInput', () => {
      const onSelectDate = jasmine.createSpy('onSelectDate');
      const fakeDate = Object.assign(new Date(), { clone: () => fakeDate });
      spyOn(DateUtils, 'futureDateFromString').andReturn(fakeDate);
      const { container } = makePopover({ onSelectDate });
      const input = container.querySelector('.date-input-section input');
      fireEvent.change(input, { target: { value: 'next monday' } });
      fireEvent.keyDown(input, { key: 'Enter', target: { value: 'next monday' } });
      expect(onSelectDate).toHaveBeenCalledWith(fakeDate, 'Custom');
    });

    it('throws error if date is invalid', () => {
      spyOn(AppEnv, 'showErrorDialog');
      spyOn(DateUtils, 'futureDateFromString').andReturn(null);
      const { container } = makePopover();
      const input = container.querySelector('.date-input-section input');
      fireEvent.change(input, { target: { value: 'not a date' } });
      fireEvent.keyDown(input, { key: 'Enter', target: { value: 'not a date' } });
      expect(AppEnv.showErrorDialog).toHaveBeenCalled();
    });
  });

  describe('render', () => {
    it('renders the provided dateOptions', () => {
      const { container } = makePopover({
        dateOptions: {
          'label 1-': () => new Date(),
          'label 2-': () => new Date(),
        },
      });
      const items = container.querySelectorAll('.item:not(.divider)');
      expect(items[0].textContent).toEqual('label 1-formatted');
      expect(items[1].textContent).toEqual('label 2-formatted');
    });

    it('renders header components', () => {
      const { container } = makePopover();
      expect(container.querySelector('.header').textContent).toEqual('my header');
    });

    it('renders footer components', () => {
      const { container } = makePopover({
        footer: (
          <span key="footer" className="footer">
            footer
          </span>
        ),
      });
      expect(container.querySelector('.footer').textContent).toEqual('footer');
      expect(container.querySelector('.date-input-section') !== null).toBe(true);
    });
  });
});
