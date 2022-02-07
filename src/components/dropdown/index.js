import { select } from 'd3';

import Component from '../Component.js';

import defaultSettings from './default-settings.js';

import {
    appendSelection,
    createSelection,
} from '../../utils/selection.js';

export default class rn3Dropdown extends Component {
    #elements;

    constructor(data) {
        super(data, defaultSettings);

        this.settings = Component.mergeSettings(defaultSettings, {});

        /*
            Add necessary elements
        */
        const dropdown = createSelection('div', { part: 'dropdown' });
        const form = createSelection('div', { part: 'form' });
        const field = appendSelection(form, 'div', { part: 'form-field' });
        const arrow = appendSelection(form, 'div', { part: 'form-arrow' });
        const input = appendSelection(field, 'input', { part: 'form-input' });

        /*
            Add elements to shadow DOM
        */
        this.shadowRoot.append(dropdown.node());
        this.shadowRoot.append(form.node());

        /*
            Elements
        */
        this.#elements = {
            dropdown,
            form,
            field,
            arrow,
            input,
        };

        this.#elements.arrow.html(this.settings.form.arrow);
        this.#elements.input.attr('placeholder', this.settings.form.placeholder);

        /*
            Add event listener
        */
        this.#elements.input.on('keyup', this.#handleKeyUp);

        this.#elements.form.on('click', () => {
            const isOpen = select(this)
                .classed('rn3-dropdown--open');

            if (isOpen) {
                this.#closeDropdown();
            }

            if (!isOpen) {
                this.#openDropdown();
            }
        });

        this.on('outside-click', () => {
            const selectedItem = this.data.values.find((d) => d.selected === true);

            if (selectedItem) {
                this.#addInputItem(selectedItem);
            }

            const isOpen = select(this)
                .classed('rn3-dropdown--open');

            if (!isOpen) {
                return;
            }

            this.#closeDropdown();
        });
    }

    // eslint-disable-next-line react/no-unused-class-component-methods
    update = (updatedData) => {
        this.data = {
            ...this.data,
            ...updatedData,
        };

        this.settings = Component.mergeSettings(defaultSettings, this.data.settings);

        const selectedItem = this.data.values.find((d) => d.selected === true);

        if (selectedItem) {
            this.#addInputItem(selectedItem);
        }

        this.#updateDropdownList();
    };

    #updateDropdownList = () => {
        const {
            dropdown,
        } = this.settings;

        const dropdownItems = this.#elements.dropdown
            .selectAll('span.item').data(this.data.values);

        dropdownItems
            .enter()
            .append('span')
            .attr('class', 'item')
            .attr('part', 'item')
            .attr('data-click-to-select', dropdown.item.clickToSelect)
            .attr('data-click-to-remove', dropdown.item.clickToRemove)
            .attr('data-enter-to-select', dropdown.item.enterToSelect)
            .attr('data-enter-to-remove', dropdown.item.enterToRemove)
            .merge(dropdownItems)
            .on('click', (e, d) => {
                this.#deselectAllItems();
                this.#selectItem(d);
                this.#addInputItem(d);
                this.#updateDropdownList();
                this.dispatch('added', d);
                this.#closeDropdown();
            })
            .attr('part', (d) => (d.selected === true ? 'item item--selected' : 'item'))
            .html(dropdown.item.render);

        dropdownItems
            .exit()
            .remove();
    };

    #handleKeyUp = (e) => {
        this.dispatch('test', e);
    };

    #addInputItem = (d) => {
        this.#elements.input.node().value = this.settings.form.item.render(d);
    };

    #selectItem = (datum) => this.data.values.map((d) => {
        if (this.getIdentity(d) === this.getIdentity(datum)) {
            const j = d;

            j.selected = true;

            return j;
        }

        return this.data;
    });

    #deselectAllItems = () => this.data.values.map((datum) => {
        const d = datum;

        d.selected = false;

        return d;
    });

    #focusInput = () => {
        const input = this.#elements.input.node();

        input.focus();

        if (input.value.length) {
            input.setSelectionRange(0, input.value.length);
        }
    };

    #openDropdown = () => {
        this.#focusInput();
        this.#toggleDropdown(true);
    };

    #closeDropdown = () => {
        this.#toggleDropdown(false);
    };

    #toggleDropdown = (open) => {
        select(this)
            .classed('rn3-dropdown--open', open);
    };
}

// export class rn3Dropdown extends HTMLElement {
//     #elements;

//     constructor() {
//         super();

//         this.attachShadow({ mode: 'open' });

//         const input = document.createElement('input');

//         input.innerHTML = 'HELLO';

//         this.shadowRoot.append(input);

//         input.addEventListener('keyup', (e) => {
//             console.log(e);
//         });
//     }

//     static get observedAttributes() {
//         return ['disabled', 'open'];
//     }

//     connectedCallback() {
//         console.log('CONNECTED');
//     }

//     disconnectedCallback() {
//         console.log('DISCONNECTED');
//     }

//     attributeChangedCallback(attrName, oldVal, newVal) {
//         console.log('attributeChangedCallback', attrName, oldVal, newVal);
//     }

//     // A getter/setter for an open property.
//     get open() {
//         return this.hasAttribute('open');
//     }

//     set open(val) {
//     // Reflect the value of the open property as an HTML attribute.
//         if (val) {
//             this.setAttribute('open', '');
//         } else {
//             this.removeAttribute('open');
//         }
//         // this.toggleDrawer();
//     }

// }

window.customElements.define('rn3-dropdown', rn3Dropdown);
