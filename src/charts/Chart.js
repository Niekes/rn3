import {
    select,
} from 'd3';

import {
    addCanvas,
    updateCanvas,
    createVirtualCanvas,
} from '../utils/canvas';

export default class Super {
    constructor(data, settings) {
        this.data = data;

        /*
            Merge settings
        */
        this.mergeSettings(settings, this.data.settings);

        /*
            Setup pubsub
        */
        this.events = [];

        /*
            Setup canvas
        */
        this.canvas = addCanvas.call(this);

        /*
            Setup virtual canvas
        */
        this.virtualCanvas = createVirtualCanvas.call(this);

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
        this.canvas = updateCanvas.call(this);

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
