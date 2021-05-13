import {
    select,
} from 'd3';

import {
    createCanvas,
    updateCanvas,
    createVirtualCanvas,
} from '../utils/canvas';

import {
    computeInnerHeight,
    computeInnerWidth,
    getHeight,
    getWidth,
} from '../utils/dimension';

import uuid from '../utils/uuid';

export default class Super {
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
            Compute height & width
        */
        const height = getHeight(this.data.el);
        const width = getWidth(this.data.el);

        /*
            Compute inner height & inner width
        */
        this.height = computeInnerWidth(height, this.settings.margin);
        this.width = computeInnerHeight(width, this.settings.margin);

        /*
            Setup pubsub events
        */
        this.events = [];

        /*
            Setup canvas
        */
        this.canvas = createCanvas(this.data.el, this.id, height, width);

        /*
            Setup virtual canvas
        */
        this.virtualCanvas = createVirtualCanvas(this.data.el, height, width);

        /*
            Setup virtual context
        */
        this.virtualContext = this.virtualCanvas.node().getContext('2d');

        /*
            Create detached container
        */
        this.detachedContainer = select(document.createElement('custom'));
    }

    mergeSettings = (oldSettings, newSetting) => {
        this.settings = {
            ...oldSettings,
            ...newSetting,
        };
    }

    getFill = d => d.fill;

    getIdentifier = d => d.id;

    updateCanvas = () => {
        const height = getHeight(this.data.el);
        const width = getWidth(this.data.el);

        this.height = computeInnerWidth(height, this.settings.margin);
        this.width = computeInnerHeight(width, this.settings.margin);

        this.canvas = updateCanvas(this.data.el, this.id, height, width);

        this.context = this.canvas.node().getContext('2d');
        this.context.translate(this.settings.margin.left * 2, this.settings.margin.top * 2);
        this.context.scale(2, 2);
    }

    ioObserve = () => {
        this.observer = new IntersectionObserver((entries, observer) => {
            this.dispatch('intersectionObserver', {
                entries,
                observer,
            });
        }, this.settings.intersectionObserverOptions);

        this.observer.observe(document.querySelector(this.data.el));
    }

    ioDisconnect = () => {
        if (this.observer) {
            this.observer.disconnect();
        }

        if (this.events.intersectionObserver) {
            this.events.intersectionObserver = [];
        }
    }

    off = (eventName, fn) => {
        const event = this.events[eventName];

        /*
            If event and function was passed we only remove the
            passed function from the passed event
        */
        if (event) {
            for (let i = 0; i < event.length; i += 1) {
                if (event[i] === fn) {
                    event.splice(i, 1);
                    break;
                }
            }
        }

        /*
            If no event was passed we remove all events
        */
        if (!event) {
            this.events = [];
        }
    }

    on = (eventName, fn) => {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    }

    dispatch = (eventName, data) => {
        let returnValue = null;

        if (this.events[eventName]) {
            this.events[eventName].forEach((fn) => {
                returnValue = fn(data);
            });
        }

        if (returnValue) {
            return returnValue;
        }

        return undefined;
    }
}
