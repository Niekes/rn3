import {
    select,
    scaleBand,
    scaleLinear,
} from 'd3';

import Chart from '../Chart';

import defaultSettings from './default-settings';

import {
    drawXAxis,
    drawYAxis,
    render,
} from '../../utils/canvas';

import {
    updateSelection,
} from '../../utils/update-pattern';

import {
    transparentize,
} from '../../utils/color';

export default class Barchart extends Chart {
    constructor(data) {
        super(data, defaultSettings);
    }

    update(updatedData) {
        /*
            Merge settings
        */
        this.mergeSettings(this.settings, updatedData.settings);

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
        updateSelection.call(this, {
            join: {
                cssClass: 'bars',
                data: updatedData.values,
            },
            enter: {
                fill: this.getFill,
                height: 0,
                width: this.setWidthOfBars,
                x: this.getXPositionOfBars,
                y: this.getYScale0,
            },
            update: {
                fill: this.getFill,
                height: this.getHeightOfBars,
                width: this.setWidthOfBars,
                x: this.getXPositionOfBars,
                y: this.getYPositionOfBars,
            },
            exit: {
                height: 0,
                y: this.getYScale0,
                fill: this.getTransparentizeFill,
            },
        });

        /*
            Create, update and remove x-ticks
        */
        updateSelection.call(this, {
            join: {
                cssClass: 'x-ticks',
                data: updatedData.values,
            },
            enter: {
                fill: transparentize(this.settings.xAxis.fill),
                height: 0,
                x: this.setXPositionOfXTicks,
                y: this.getYScale0,
            },
            update: {
                fill: this.settings.xAxis.fill,
                height: this.getHeightOfXTicks,
                x: this.setXPositionOfXTicks,
                y: this.setYPositionOfXTicks,
            },
            exit: {
                fill: transparentize(this.settings.xAxis.fill),
                height: 0,
                y: this.getYScale0,
            },
        });

        /*
            Create, update and remove y-ticks
        */
        updateSelection.call(this, {
            join: {
                cssClass: 'y-ticks',
                data: this.yScale.ticks(this.settings.yAxis.ticks),
                identifier: null,
            },
            enter: {
                fill: transparentize(this.settings.yAxis.fill),
                width: 0,
                x: this.setXPositionOfYTicks,
                y: this.setYPositionOfYTicks,
            },
            update: {
                fill: this.settings.yAxis.fill,
                width: this.settings.yAxis.tickSize,
                x: this.setXPositionOfYTicks,
                y: this.setYPositionOfYTicks,
            },
            exit: {
                fill: transparentize(this.settings.yAxis.fill),
            },
        });

        /*
            Render on canvas
        */
        render(this.draw, this.settings.transition.duration);
    }

    draw = () => {
        this.context.clearRect(
            -this.settings.margin.left,
            -this.settings.margin.top,
            this.width * 2,
            this.height * 2,
        );
        this.context.fill();

        this.virtualContext.clearRect(0, 0, this.width, this.height);
        this.virtualContext.fill();

        const bars = this.detachedContainer.selectAll('custom.bars');

        bars.each((d, i, nodes) => {
            const node = select(nodes[i]);

            this.context.beginPath();
            this.context.fillStyle = node.attr('fill');
            this.context.rect(
                +node.attr('x'),
                +node.attr('y'),
                +node.attr('width'),
                +node.attr('height'),
            );
            this.context.fill();
        });

        drawXAxis.call(this);
        drawYAxis.call(this);
    }

    getYScale0 = () => this.yScale(0);

    getXPositionOfBars = d => this.xScale(d.id);

    getYPositionOfBars = d => Math.min(this.getYScale0(), this.yScale(d.value));

    setWidthOfBars = () => this.xScale.bandwidth();

    getHeightOfBars = d => Math.abs(this.yScale(d.value) - this.getYScale0());

    getTransparentizeFill = d => transparentize(this.getFill(d));

    /*
        TICKS
    */
    setXPositionOfXTicks = d => this.xScale(d.id) + this.xScale.bandwidth() / 2;

    setYPositionOfXTicks = d => (d.value > 0
        ? this.yScale(0)
        : this.yScale(0) - this.settings.xAxis.tickSize);

    setXPositionOfYTicks = () => 0;

    setYPositionOfYTicks = d => this.yScale(d);

    getHeightOfXTicks = d => (d.value > 0
        ? this.settings.xAxis.tickSize
        : this.settings.xAxis.tickSize)
}
