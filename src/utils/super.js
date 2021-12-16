import {
    selectAll,
} from 'd3';

import uuid from './uuid.js';

import {
    mergeDeep,
} from './object.js';

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

        /*
            Add event listener to document for outside click
        */
        document.addEventListener('click', Super.checkOutsideClick.bind(null, this.id, this.dispatch), true);
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
            If no event was passed we remove all events and event listener
        */
        if (!event) {
            this.#events = {};

            document.removeEventListener('click', Super.checkOutsideClick.bind(null, this.id, this.dispatch), true);
        }

        return this.#events;
    };

    on = (eventName, fn) => {
        this.#events[eventName] = fn;

        return this.#events;
    };

    dispatch = (eventName, data) => {
        if (this.#events[eventName]) {
            return this.#events[eventName](data);
        }

        return this.#events;
    };

    static mergeSettings = (oldSettings, newSetting) => mergeDeep(oldSettings, newSetting);

    static checkOutsideClick = (id, dispatch, event) => {
        const outside = selectAll(`#${id}, #${id} *`)
            .filter((d, i, nodes) => nodes[i] === event.target)
            .empty();

        if (outside) {
            dispatch('outside-click');
        }

        return outside;
    };

    getIdentity = (d) => d[this.settings.identity];
}
