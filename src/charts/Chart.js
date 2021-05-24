import {
    select,
    pointer,
    rgb,
} from 'd3';

import {
    createCanvas,
    updateCanvas,
    createVirtualCanvas,
    updateVirtualCanvas,
} from '../utils/canvas';

import {
    computeInnerHeight,
    computeInnerWidth,
    getHeight,
    getWidth,
} from '../utils/dimension';

import {
    transparentize,
} from '../utils/color';

import {
    setTooltip,
    unsetTooltip,
} from '../utils/tooltip';

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
            Compute height & width
        */
        const height = getHeight(this.data.el);
        const width = getWidth(this.data.el);

        /*
            Compute inner height & inner width
        */
        this.height = computeInnerHeight(height, this.settings.margin);
        this.width = computeInnerWidth(width, this.settings.margin);

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
        this.virtualCanvas = createVirtualCanvas(this.id, height, width);

        /*
            Setup virtual context
        */
        this.virtualContext = this.virtualCanvas.node().getContext('2d');

        /*
            Create detached container
        */
        this.detachedContainer = select(document.createElement('custom'));

        /*
            Create tooltip data map
        */
        this.tooltipData = new Map();

        /*
            Listen on mousemoves
        */
        this.canvas.on('mousemove', (e) => {
            const [x, y] = pointer(e);

            const imageData = this.virtualContext
                .getImageData(x * 2, y * 2, 1, 1);

            const c = rgb(...imageData.data).toString();
            const d = this.tooltipData.get(c);

            setTooltip(d, ...pointer(e, document.documentElement));
        });

        this.canvas.on('mouseleave', unsetTooltip);
    }

    mergeSettings = (oldSettings, newSetting) => {
        this.settings = {
            ...oldSettings,
            ...newSetting,
        };
    }

    getFill = d => d.fill;

    getFillTransparentized = d => transparentize(this.getFill(d));

    getIdentity = d => d[this.settings.identity];

    updateCanvas = () => {
        const height = getHeight(this.data.el);
        const width = getWidth(this.data.el);

        this.height = computeInnerHeight(height, this.settings.margin);
        this.width = computeInnerWidth(width, this.settings.margin);

        this.canvas = updateCanvas(this.data.el, this.id, height, width);
        this.virtualCanvas = updateVirtualCanvas(this.virtualCanvas, height, width);

        this.context = this.canvas.node().getContext('2d');
        this.context.translate(this.settings.margin.left * 2, this.settings.margin.top * 2);
        this.context.scale(2, 2);

        this.virtualContext = this.virtualCanvas.node().getContext('2d');
        this.virtualContext.translate(this.settings.margin.left * 2, this.settings.margin.top * 2);
        this.virtualContext.scale(2, 2);

        this.clearTooltipData();

        unsetTooltip();
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

    clearTooltipData = () => {
        if (this.tooltipData.size > 0) {
            this.tooltipData.clear();
        }
    }
}
