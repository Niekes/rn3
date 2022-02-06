import {
    select,
    selectAll,
} from 'd3';

import {
    mergeDeep,
} from '../utils/object.js';

export default class Component extends HTMLElement {
    #events;

    constructor() {
        super();

        /*
            Attach shadow DOM
        */
        this.attachShadow({ mode: 'open' });

        /*
            Setup pubsub events
        */
        this.#events = {};
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

            document.removeEventListener('click', Component.checkOutsideClick.bind(null, this.id, this.dispatch), true);
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

    connectedCallback() {
        const id = this.getAttribute('id');

        if (!id) {
            throw new Error(`No id was set on "${this.constructor.name}"`);
        }

        /*
            Set rn3 class
        */
        this.setAttribute('class', `${this.settings.css}`.toLowerCase());

        /*
            Add event listener to document for outside click
        */
        document.addEventListener(
            'click',
            Component.checkOutsideClick.bind(null, this.getAttribute('id'), this.dispatch),
            true,
        );
    }

    disconnectedCallback() {
        this.off();
    }

    static mergeSettings = (oldSettings, newSetting) => mergeDeep(oldSettings, newSetting);

    static getShadowRoot = () => this.shadowRoot;

    static getShadowRootSelection = () => select(this.shadowRoot);

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
