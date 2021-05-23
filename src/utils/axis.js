import {
    select,
} from 'd3';

import {
    updateSelection,
} from './update-pattern';

import {
    transparentize,
} from './color';

export function drawXAxis(ctx, parent, settings) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const {
        tickSize,
        tickFormat,
    } = settings.xAxis;

    const axis = parent.selectAll('custom.x-axis');
    const ticks = parent.selectAll('custom.x-ticks');

    axis.each((d, i, nodes) => {
        const node = select(nodes[i]);
        const x = +node.attr('x');
        const y = +node.attr('y');
        const width = +node.attr('width');
        const fillStyle = node.attr('fill');

        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = fillStyle;
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();
    });

    ticks.each((d, i, nodes) => {
        const node = select(nodes[i]);
        const x = +node.attr('x');
        const y = +node.attr('y');
        const height = +node.attr('height');
        const fill = node.attr('fill');

        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.strokeStyle = fill;
        ctx.stroke();
        ctx.fillText(
            tickFormat(d.id),
            x,
            d.value > 0
                ? y + height + tickSize
                : y + height - (tickSize * 2),
        );
    });

    return ctx;
}

export function drawYAxis(ctx, parent, settings) {
    ctx.textAlign = 'right';

    const { yAxis } = settings;
    const { tickFormat } = yAxis;

    const axis = parent.selectAll('custom.y-axis');
    const ticks = parent.selectAll('custom.y-ticks');

    axis.each((d, i, nodes) => {
        const node = select(nodes[i]);
        const x = +node.attr('x');
        const y = +node.attr('y');
        const height = +node.attr('height');
        const fillStyle = node.attr('fill');

        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = fillStyle;
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();
    });

    ticks.each((d, i, nodes) => {
        const node = select(nodes[i]);
        const x = +node.attr('x');
        const y = +node.attr('y');
        const width = +node.attr('width');
        const fillStyle = node.attr('fill');

        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = fillStyle;
        ctx.moveTo(x, y);
        ctx.lineTo(x - width, y);
        ctx.stroke();
        ctx.fillText(
            tickFormat(d),
            x - width - 2,
            y,
        );
    });

    return ctx;
}

export function bindXAxisData(join, xScale, yScale, settings) {
    const {
        xAxis,
        transition,
    } = settings;

    const y = yScale(0);
    const width = xScale.range()[1];

    /*
        Create, update and remove x-axis
    */
    updateSelection({
        join: {
            ...join,
            cssClass: 'x-axis',
            data: [0],
        },
        enter: {
            fill: transparentize(xAxis.fill),
            x: 0,
            y,
            width,
        },
        update: {
            fill: xAxis.fill,
            x: 0,
            y,
            width,
        },
        exit: {
            fill: transparentize(xAxis.fill),
        },
    }, transition);

    /*
        Create, update and remove x-ticks
    */
    updateSelection({
        join,
        enter: {
            fill: transparentize(xAxis.fill),
            height: 0,
            x(d) {
                return xScale(d.id) + xScale.bandwidth() / 2;
            },
            y(d) {
                return d.value > 0
                    ? yScale(0)
                    : yScale(0) - xAxis.tickSize;
            },
        },
        update: {
            fill: xAxis.fill,
            height(d) {
                return d.value > 0
                    ? xAxis.tickSize
                    : xAxis.tickSize;
            },
            x(d) {
                return xScale(d.id) + xScale.bandwidth() / 2;
            },
            y(d) {
                return d.value > 0
                    ? yScale(0)
                    : yScale(0) - xAxis.tickSize;
            },
        },
        exit: {
            fill: transparentize(xAxis.fill),
            height: 0,
            y() {
                return yScale(0);
            },
        },
    }, transition);
}

export function bindYAxisData(join, yScale, settings) {
    const {
        yAxis,
        transition,
    } = settings;

    const height = yScale.range()[0];

    /*
        Create, update and remove x-axis
    */
    updateSelection({
        join: {
            ...join,
            cssClass: 'y-axis',
            data: [0],
        },
        enter: {
            fill: transparentize(yAxis.fill),
            x: 0,
            y: 0,
            height,
        },
        update: {
            fill: yAxis.fill,
            x: 0,
            y: 0,
            height,
        },
        exit: {
            fill: transparentize(yAxis.fill),
        },
    }, transition);

    /*
        Create, update and remove x-ticks
    */
    updateSelection({
        join,
        enter: {
            fill: transparentize(yAxis.fill),
            width: 0,
            x: 0,
            y(d) {
                return yScale(d);
            },
        },
        update: {
            fill: yAxis.fill,
            width: yAxis.tickSize,
            x: 0,
            y(d) {
                return yScale(d);
            },
        },
        exit: {
            fill: transparentize(yAxis.fill),
        },
    }, transition);
}
