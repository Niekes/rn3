import Element from '../Element';

import {
    appendSelection,
} from '../../utils/selection';

import defaultSettings from './default-settings';

export default class Datepicker extends Element {
    #elements;

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

        this.#elements = {
            dropdown,
            form,
            icon,
            display,
            arrow,
        };

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
}
