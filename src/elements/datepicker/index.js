import Element from '../Element';

import {
    appendSelection,
} from '../../utils/selection';

import {
    timeMonday,
    timeDay,
    normalizeHours,
    getFirstOfMonth,
    getLastOfMonth,
} from '../../utils/date';

import defaultSettings from './default-settings';

export default class Datepicker extends Element {
    #elements;

    #today;

    constructor(data) {
        super(data, defaultSettings);

        /*
            Add necessary elements
        */
        const dropdown = appendSelection(Element.container, 'div', { class: 'rn3-datepicker__dropdown' });
        const form = appendSelection(Element.container, 'div', { class: 'rn3-datepicker__form' });
        const icon = appendSelection(form, 'div', { class: 'rn3-datepicker__form-icon' });
        const display = appendSelection(form, 'div', { class: 'rn3-datepicker__form-display' });
        const arrow = appendSelection(form, 'div', { class: 'rn3-datepicker__form-arrow' });
        const periodControl = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-period-control' });
        const customPeriodsWrapper = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-periods-wrapper' });

        this.#elements = {
            dropdown,
            form,
            icon,
            display,
            arrow,
            periodControl,
            customPeriodsWrapper,
        };

        this.#today = new Date();

        this.#elements.icon.html(this.settings.form.icon);
        this.#elements.arrow.html(this.settings.form.arrow);
        this.#elements.dropdown.html('HELLLOOO');

        /*
            Add event listener
        */
        this.#elements.form.on('click', () => {
            const isOpen = this.#elements.dropdown
                .classed('rn3-datepicker__dropdown--open');

            if (isOpen) {
                this.#closeDropdown();
            }

            if (!isOpen) {
                this.#openDropdown();
            }
        });

        this.on('outside-click', () => {
            this.#closeDropdown();
        });
    }

    update(updatedData) {
        this.data = {
            ...this.data,
            ...updatedData,
        };

        this.settings = Element.mergeSettings(this.settings, this.data.settings);

        /*
            Normalize hours
        */
        normalizeHours(this.data.values.from);
        normalizeHours(this.data.values.to);
        normalizeHours(this.settings.minDate);
        normalizeHours(this.settings.maxDate);
        normalizeHours(this.#today);

        this.settings.customPeriods.forEach((c) => {
            normalizeHours(c.from);
            normalizeHours(c.to);
        });

        /*
            Check if custom periods were set
        */
        if (this.settings.customPeriods.length === 0) {
            this.#elements.customPeriodsWrapper.remove();
        }

        /*
            Convert dates
        */
        const convertedDates = this.#convertDates(this.data.values);

        console.log(convertedDates);

        /*
            Set css classes
        */
        // this.setCssClassToWrapper('u3-date-picker--day-mode', this.settings.activeMode === 'day');
        // this.setCssClassToWrapper('u3-date-picker--week-mode', this.settings.activeMode === 'week');
        // this.setCssClassToWrapper('u3-date-picker--month-mode', this.settings.activeMode === 'month');

        const from = this.#renderDate(this.data.values.from);
        const to = this.#renderDate(this.data.values.to);

        /*
            Update date display
        */
        if (from === to) {
            this.#elements.display.text(from);
        }

        if (from !== to) {
            this.#elements.display.text(`${from} - ${to}`);
        }
    }

    #renderDate = date => this.settings.modes[this.settings.activeMode].render(date)

    #openDropdown = () => {
        this.#toggleDropdown(true);
    }

    #closeDropdown = () => {
        this.#toggleDropdown(false);
    }

    #toggleDropdown = (open) => {
        this.#elements.dropdown
            .classed('rn3-datepicker__dropdown--open', open);

        if (!open) {
            this.#elements.dropdown.html(null);
        }
    }

    #convertDates = (dates) => {
        switch (this.settings.activeMode) {
        case 'day': {
            return Object.assign({}, dates);
        }
        case 'month': {
            return {
                from: getFirstOfMonth(dates.from),
                to: getLastOfMonth(dates.to),
            };
        }
        case 'week': {
            return {
                from: timeMonday(dates.from),
                to: timeDay.offset(timeMonday(dates.to), 6),
            };
        }
        default:
            throw new Error(`Selected mode does not exist: ${this.settings.activeMode}`);
        }
    };
}
