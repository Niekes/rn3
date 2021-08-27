import {
    select,
    scaleBand,
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

export default class Heatmap extends Chart {
    #tileSize;

    constructor(data) {
        super(data, defaultSettings);
    }

    update(updatedData) {
        this.data = {
            ...this.data,
            ...updatedData,
        };

        /*
            Merge settings
        */
        this.settings = Chart.mergeSettings(this.settings, this.data.settings);

        /*
            Grid
        */
        this.#tileSize = this.width / this.settings.grid.columns;

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

        this.yScale = scaleBand()
            .range([this.height, 0])
            .padding(this.settings.yScale.padding);

        /*
            Compute domains
        */
        const domainX = this.settings.xScale.domain(this.data.values);
        const domainY = this.settings.yScale.domain(this.data.values);

        /*
            Update domains of x & y scales
        */
        this.xScale.domain(domainX).range([0, this.width]);
        this.yScale.domain(domainY).range([this.height, 0]);

        /*
            Create, update and remove tiles
        */
        updateSelection({
            join: {
                cssClass: 'tiles',
                data: this.data.values,
                identity: this.getIdentity,
                parent: this.detachedContainer,
            },
            enter: {
                fill: Chart.getFillTransparentized,
                height: 0,
                width: 0,
                x: this.#getXPositionOfTiles,
                y: this.#getYPositionOfTiles,
            },
            update: {
                fill: Chart.getFill,
                height: this.#getHeightOfTiles,
                width: this.#getWidthOfTiles,
                x: this.#getXPositionOfTiles,
                y: this.#getYPositionOfTiles,
            },
            exit: {
                height: 0,
                y: 0,
                fill: Chart.getFillTransparentized,
            },
        }, this.settings.transition);

        /*
            Render tiles on canvas
        */
        render(this.#draw, this.settings.transition.duration);

        /*
            Render tiles on virtual canvas
        */
        renderOnVirtualCanvas(this.#drawOnVirtualCanvas, this.settings.transition.duration);

        /*
            Bind data for x-ticks
        */
        bindXAxisData(
            {
                cssClass: 'x-ticks',
                data: domainX,
                identity: d => d,
                parent: this.detachedContainer,
            },
            this.xScale,
            this.settings,
            this.height,
            0,
        );

        /*
            Bind data for y-ticks
        */
        bindYAxisData(
            {
                cssClass: 'y-ticks',
                data: domainY,
                identity: d => d,
                parent: this.detachedContainer,
            },
            this.yScale,
            this.settings,
            this.width,
        );
    }

    #draw = () => {
        clearCanvas(this.context, this.settings.margin, this.height, this.width);

        const tiles = this.detachedContainer.selectAll('custom.tiles');

        tiles.each((d, i, nodes) => {
            const tile = select(nodes[i]);
            const x = +tile.attr('x');
            const y = +tile.attr('y');
            const height = +tile.attr('height');
            const width = +tile.attr('width');

            this.context.beginPath();
            this.context.fillStyle = tile.attr('fill');
            this.context.rect(x, y, width, height);
            this.context.fill();
        });

        drawXAxis(this.context, this.detachedContainer, this.settings);
        drawYAxis(this.context, this.detachedContainer, this.settings);
    }

    #drawOnVirtualCanvas = () => {
        clearCanvas(this.virtualContext, this.settings.margin, this.height, this.width);

        const tiles = this.detachedContainer.selectAll('custom.tiles');

        tiles.each((d, i, nodes) => {
            const tile = select(nodes[i]);
            const x = +tile.attr('x');
            const y = +tile.attr('y');
            const height = +tile.attr('height');
            const width = +tile.attr('width');
            const datum = tile.datum();

            /*
                Draw to virtual context
            */
            if (has(datum, 'tooltip')) {
                const uniqueColor = getUniqueColorByIndex(i);

                this.setTooltipData(uniqueColor, datum.tooltip);

                this.virtualContext.beginPath();
                this.virtualContext.fillStyle = uniqueColor;
                this.virtualContext.rect(x, y, width, height);
                this.virtualContext.fill();
            }
        });
    }

    #getXPositionOfTiles = d => this.xScale(d.x);

    #getYPositionOfTiles = d => this.yScale(d.y);

    #getWidthOfTiles = () => this.xScale.bandwidth();

    #getHeightOfTiles = () => this.yScale.bandwidth();
}
