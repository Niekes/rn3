import {
    select,
    scaleBand,
    scaleLinear,
} from 'd3';

import Chart from '../Chart';

import defaultSettings from './default-settings';

import {
    render,
    clearCanvas,
    renderOnVirtualCanvas,
} from '../../utils/canvas';

import {
    has,
} from '../../utils/object';

import {
    updateSelection,
} from '../../utils/update-pattern';

import {
    drawXAxis,
    drawYAxis,
    bindXAxisData,
    bindYAxisData,
} from '../../utils/axis';

import {
    getUniqueColorByIndex,
} from '../../utils/color';

export default class Barchart extends Chart {
    constructor(data) {
        super(data, defaultSettings);
    }

    update(updatedData) {
        // this.data = { // use this.data
        //     ...this.data,
        //     ...updatedData,
        // };
        /*
            Merge settings
        */
        this.settings = Chart.mergeSettings(this.settings, updatedData.settings);

        /*
            Update canvas
        */
        this.updateCanvas();

        /*
            Update scales
        */
        this.xScale = scaleBand()
            .range([0, this.width])
            .padding(this.settings.xScale.padding);

        this.yScale = scaleLinear()
            .range([this.height, 0]);

        /*
            Compute domains
        */
        const domainX = this.settings.xScale.domain(updatedData.values);
        const domainY = this.settings.yScale.domain(updatedData.values);

        /*
            Update domains of x & y scales
        */
        this.xScale.domain(domainX).range([0, this.width]);
        this.yScale.domain(domainY).range([this.height, 0]);

        /*
            Create, update and remove bars
        */
        updateSelection({
            join: {
                cssClass: 'bars',
                data: updatedData.values,
                identity: this.getIdentity,
                parent: this.detachedContainer,
            },
            enter: {
                fill: Chart.getFill,
                height: 0,
                width: this.#getWidthOfBars,
                x: this.#getXPositionOfBars,
                y: this.#getYScale0,
            },
            update: {
                fill: Chart.getFill,
                height: this.#getHeightOfBars,
                width: this.#getWidthOfBars,
                x: this.#getXPositionOfBars,
                y: this.#getYPositionOfBars,
            },
            exit: {
                height: 0,
                y: this.#getYScale0,
                fill: Chart.getFillTransparentized,
            },
        }, this.settings.transition);

        /*
            Render bars on canvas
        */
        render(this.#draw, this.settings.transition.duration);

        /*
            Render bars on virtual canvas
        */
        renderOnVirtualCanvas(this.#drawOnVirtualCanvas, this.settings.transition.duration);

        /*
            Bind data for x-ticks
        */
        bindXAxisData(
            {
                cssClass: 'x-ticks',
                data: updatedData.values,
                identity: this.getIdentity,
                parent: this.detachedContainer,
            },
            this.xScale,
            this.yScale,
            this.settings,
        );

        /*
            Bind data for y-ticks
        */
        bindYAxisData(
            {
                cssClass: 'y-ticks',
                data: this.yScale.ticks(this.settings.yAxis.ticks),
                identity: null,
                parent: this.detachedContainer,
            },
            this.yScale,
            this.settings,
        );
    }

    #draw = () => {
        clearCanvas(this.context, this.settings.margin, this.height, this.width);

        const bars = this.detachedContainer.selectAll('custom.bars');

        bars.each((d, i, nodes) => {
            const bar = select(nodes[i]);
            const x = +bar.attr('x');
            const y = +bar.attr('y');
            const height = +bar.attr('height');
            const width = +bar.attr('width');

            this.context.beginPath();
            this.context.fillStyle = bar.attr('fill');
            this.context.rect(x, y, width, height);
            this.context.fill();
        });

        drawXAxis(this.context, this.detachedContainer, this.settings);
        drawYAxis(this.context, this.detachedContainer, this.settings);
    }

    #drawOnVirtualCanvas = () => {
        clearCanvas(this.virtualContext, this.settings.margin, this.height, this.width);

        const bars = this.detachedContainer.selectAll('custom.bars');

        bars.each((d, i, nodes) => {
            const bar = select(nodes[i]);
            const x = +bar.attr('x');
            const y = +bar.attr('y');
            const height = +bar.attr('height');
            const width = +bar.attr('width');
            const datum = bar.datum();
            /*
                Draw to virtual context
            */
            if (has(datum, 'tooltip')) {
                const uniqueColor = getUniqueColorByIndex(i);

                this.tooltipData.set(uniqueColor, datum.tooltip);

                this.virtualContext.beginPath();
                this.virtualContext.fillStyle = uniqueColor;
                this.virtualContext.rect(x, y, width, height);
                this.virtualContext.fill();
            }
        });
    }

    #getYScale0 = () => this.yScale(0);

    #getXPositionOfBars = d => this.xScale(this.getIdentity(d));

    #getYPositionOfBars = d => Math.min(this.#getYScale0(), this.yScale(d.value));

    #getWidthOfBars = () => this.xScale.bandwidth();

    #getHeightOfBars = d => Math.abs(this.yScale(d.value) - this.#getYScale0());
}
