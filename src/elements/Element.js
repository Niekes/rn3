import Super from '../utils/super.js';

import {
    createContainer,
} from '../utils/selection.js';

export default class Element extends Super {
    static container;

    constructor(data, settings = {}) {
        super(data, settings);

        /*
            Add container
        */
        Element.container = createContainer(
            this.data.el,
            this.id,
            `rn3-${this.constructor.name} ${this.settings.css}`.toLowerCase(),
        );
    }
}
