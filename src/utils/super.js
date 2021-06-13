import uuid from './uuid';

import {
    mergeDeep,
} from './object';

export default class Super {
    #events;

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
            Setup pubsub events
        */
        this.#events = {};

        /*
            Merge settings
        */
        this.settings = Super.mergeSettings(settings, this.data.settings);
    }

    off = (eventName) => {
        const event = this.#events[eventName];

        /*
            If event was passed we remove the passed event
        */
        if (event) {
            delete this.#events[eventName];
        }

        /*
            If no event was passed we remove all events
        */
        if (!event) {
            this.#events = {};
        }

        return this.#events;
    }

    on = (eventName, fn) => {
        this.#events[eventName] = fn;

        return this.#events;
    }

    dispatch = (eventName, data) => {
        if (this.#events[eventName]) {
            return this.#events[eventName](data);
        }

        return this.#events;
    }

    static mergeSettings = (oldSettings, newSetting) => mergeDeep(oldSettings, newSetting);

    getIdentity = d => d[this.settings.identity];
}
