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

import {
    mergeDeep,
} from '../utils/object';

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
        this.events = {};

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
            Listen on mousemoves and set tooltip
        */
        this.canvas.on('mousemove', (e) => {
            const [x, y] = pointer(e);

            const d = this.getTooltipDataByMousePosition(x, y);

            setTooltip(d, ...pointer(e, document.documentElement));
        });

        this.canvas.on('mouseleave', unsetTooltip);
    }

    getTooltipDataByMousePosition = (x, y) => {
        const imageData = this.virtualContext
            .getImageData(x * 2, y * 2, 1, 1);

        return this.tooltipData.get(rgb(...imageData.data).toString());
    };

    mergeSettings = (oldSettings, newSetting) => {
        this.settings = mergeDeep(oldSettings, newSetting);
    };

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

    off = (eventName) => {
        const event = this.events[eventName];

        /*
            If event was passed we remove the passed event
        */
        if (event) {
            delete this.events[eventName];
        }

        /*
            If no event was passed we remove all events
        */
        if (!event) {
            this.events = {};
        }

        return this.events;
    }

    on = (eventName, fn) => {
        this.events[eventName] = fn;

        return this.events;
    }

    dispatch = (eventName, data) => {
        if (this.events[eventName]) {
            return this.events[eventName](data);
        }

        return this.events;
    }

    clearTooltipData = () => {
        if (this.tooltipData.size > 0) {
            this.tooltipData.clear();
        }

        return this.tooltipData;
    }
}
