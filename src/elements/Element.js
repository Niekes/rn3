import Super from '../utils/super';

import {
    createContainer,
} from '../utils/selection';

export default class Element extends Super {
    constructor(data, settings = {}) {
        super(data, settings);

        /*
            Add container
        */
        this.container = createContainer(
            this.data.el,
            this.id,
            `rn3-${this.constructor.name} ${this.settings.css}`.toLowerCase(),
        );
    }
}
