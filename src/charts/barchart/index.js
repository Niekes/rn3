import {
    select,
    scaleBand,
    scaleLinear,
} from 'd3';

import Chart from '../Chart';

import defaultSettings from './default-settings';

import {
    render,
} from '../../utils/canvas';

import {
    updateSelection,
} from '../../utils/update-pattern';

import {
    drawXAxis,
    drawYAxis,
    bindXAxisData,
    bindYAxisData,
} from '../../utils/axis';

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
        updateSelection({
            join: {
                cssClass: 'bars',
                data: updatedData.values,
                identity: this.getIdentity,
                parent: this.detachedContainer,
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
                fill: this.getFillTransparentized,
            },
        }, this.settings.transition);

        /*
            Render bars on canvas
        */
        render(this.draw, this.settings.transition.duration);

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
            const bar = select(nodes[i]);

            this.context.beginPath();
            this.context.fillStyle = bar.attr('fill');
            this.context.rect(
                +bar.attr('x'),
                +bar.attr('y'),
                +bar.attr('width'),
                +bar.attr('height'),
            );
            this.context.fill();
        });

        drawXAxis(this.context, this.detachedContainer, this.settings);
        drawYAxis(this.context, this.detachedContainer, this.settings);
    }

    getYScale0 = () => this.yScale(0);

    getXPositionOfBars = d => this.xScale(d.id);

    getYPositionOfBars = d => Math.min(this.getYScale0(), this.yScale(d.value));

    setWidthOfBars = () => this.xScale.bandwidth();

    getHeightOfBars = d => Math.abs(this.yScale(d.value) - this.getYScale0());
}
