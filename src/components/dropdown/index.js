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

        /*
            Add necessary elements
        */
        const dropdown = createSelection('div', { part: 'dropdown' });
        const form = createSelection('div', { part: 'form' });
        const field = appendSelection(form, 'div', { part: 'form-field' });
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
            input,
        };

        /*
            Add event listener
        */
        input.on('keyup', this.#handleKeyUp);
    }

    // eslint-disable-next-line react/no-unused-class-component-methods
    update = (updatedData) => {
        this.data = {
            ...this.data,
            ...updatedData,
        };

        this.settings = Component.mergeSettings(defaultSettings, this.data.settings);

        const dropdownItems = this.#elements.dropdown
            .selectAll('span[part="list-item"]').data(this.data.values);

        dropdownItems
            .enter()
            .append('span')
            .attr('part', 'list-item')
            .merge(dropdownItems)
            .html(this.settings.dropdown.item.render);

        dropdownItems
            .exit()
            .remove();
    };

    #handleKeyUp = (e) => {
        this.dispatch('test', e);
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
