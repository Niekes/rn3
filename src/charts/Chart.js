import {
    select,
    pointer,
    rgb,
} from 'd3';

import Super from '../utils/super';

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
    has,
} from '../utils/object';

import {
    transparentize,
} from '../utils/color';

import {
    setTooltip,
    unsetTooltip,
} from '../utils/tooltip';

export default class Chart extends Super {
    #virtualCanvas;

    constructor(data, settings = {}) {
        super(data, settings);

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
            Setup canvas
        */
        this.canvas = createCanvas(this.data.el, this.id, height, width);

        /*
            Setup virtual canvas
        */
        this.#virtualCanvas = createVirtualCanvas(this.id, height, width);

        /*
            Setup virtual context
        */
        this.virtualContext = this.#virtualCanvas.node().getContext('2d');

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

            const d = this.#getTooltipDataByMousePosition(x, y);


            if (d && has(d, 'data')) {
                // console.log(this.data.values);
            }

            if (!d) {
                // console.log('UNSET');
            }

            setTooltip(d, ...pointer(e, document.documentElement));
        });

        this.canvas.on('mouseleave', unsetTooltip);
    }

    #getTooltipDataByMousePosition = (x, y) => {
        const imageData = this.virtualContext
            .getImageData(x * 2, y * 2, 1, 1);

        return this.tooltipData.get(rgb(...imageData.data).toString());
    };

    updateCanvas = () => {
        const height = getHeight(this.data.el);
        const width = getWidth(this.data.el);

        this.height = computeInnerHeight(height, this.settings.margin);
        this.width = computeInnerWidth(width, this.settings.margin);

        this.canvas = updateCanvas(this.data.el, this.id, height, width);
        this.#virtualCanvas = updateVirtualCanvas(this.#virtualCanvas, height, width);

        this.context = this.canvas.node().getContext('2d');
        this.context.translate(this.settings.margin.left * 2, this.settings.margin.top * 2);
        this.context.scale(2, 2);

        this.virtualContext = this.#virtualCanvas.node().getContext('2d');
        this.virtualContext.translate(this.settings.margin.left * 2, this.settings.margin.top * 2);
        this.virtualContext.scale(2, 2);

        this.#clearTooltipData();

        unsetTooltip();
    }

    #clearTooltipData = () => {
        if (this.tooltipData.size > 0) {
            this.tooltipData.clear();
        }

        return this.tooltipData;
    }

    setTooltipData(key, value) {
        this.tooltipData.set(key, value);
    }

    static getFill = d => d.fill;

    static getFillTransparentized = d => transparentize(Chart.getFill(d));
}
