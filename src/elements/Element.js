import Super from '../utils/super';

import {
    createContainer,
} from '../utils/selection';

export default class Chart extends Super {
    constructor(data, settings) {
        super(data, settings);

        /*
            Add container
        */
        this.container = createContainer(
            this.data.el,
            this.id,
            `rn3-${this.constructor.name}`.toLowerCase(),
        );
    }
}
