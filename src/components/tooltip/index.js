import Component from '../Component';

import defaultSettings from './default-settings';

import {
    createSelection,
} from '../../utils/selection';

export default class rn3Tooltip extends Component {
    constructor(data) {
        super(data, defaultSettings);

        /*
            Add necessary elements
        */
        const content = createSelection('slot', { part: 'tooltip-content', name: 'content' });

        content.html('...');

        /*
            Add elements to shadow DOM
        */
        this.shadowRoot.append(content.node());

        /*
            Elements
        */
        this.#elements = {
            content,
        };
    }

    update = (updatedData) => {
        this.data = {
            ...this.data,
            ...updatedData,
        };

        this.settings = Component.mergeSettings(defaultSettings, this.data.settings);

        /*
            TODO
            Add magic here
        */
    }

    #elements;
}

window.customElements.define('rn3-tooltip', rn3Tooltip);
