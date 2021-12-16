import Element from '../Element';

import defaultSettings from './default-settings';

import {
    appendSelection,
} from '../../utils/selection';

export default class Dropdown extends Element {
    #elements;

    constructor(data) {
        super(data, defaultSettings);

        /*
            Add necessary elements
        */
        const dropdown = appendSelection(Element.container, 'div', { class: 'rn3-dropdown__dropdown' });
        const form = appendSelection(Element.container, 'div', { class: 'rn3-dropdown__form' });
        const field = appendSelection(form, 'div', { class: 'rn3-dropdown__form-field' });
        const input = appendSelection(field, 'input', { class: 'rn3-dropdown__form-input', placeholder: this.settings.form.placeholder });

        this.#elements = {
            field,
            dropdown,
            form,
            input,
        };
    }

    update = (updatedData) => {
        this.data = {
            ...this.data,
            ...updatedData,
        };

        const dropdownItems = this.#elements.dropdown
            .selectAll('span.dropdown-group__list-item').data(this.data.values);

        dropdownItems
            .enter()
            .append('span')
            .attr('class', 'dropdown-group__list-item')
            .merge(dropdownItems)
            .html(this.settings.dropdown.item.render);

        dropdownItems
            .exit()
            .remove();
    }
}
