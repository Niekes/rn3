import {
    mergeDeep,
} from '../utils/object';

import {
    createContainer,
} from '../utils/selection';

import uuid from '../utils/uuid';

export default class Chart {
    constructor(data, settings) {
        /*
            Set id
        */
        this.id = uuid(`rn3-${this.constructor.name}`).toLowerCase();

        /*
            Set data
        */
        this.data = data;

        /*
            Merge settings
        */
        this.mergeSettings(settings, this.data.settings);

        /*
            Add container
        */
        this.container = createContainer(
            this.data.el,
            this.id,
            `rn3-${this.constructor.name}`.toLowerCase(),
        );
    }

    mergeSettings = (oldSettings, newSetting) => {
        this.settings = mergeDeep(oldSettings, newSetting);
    };

    getIdentity = d => d[this.settings.identity];
}
