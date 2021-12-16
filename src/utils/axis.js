import {
    select,
} from 'd3';

import {
    updateSelection,
} from './update-pattern.js';

import {
    transparentize,
} from './color.js';

export function drawXAxis(ctx, parent, settings) {
    const {
        type,
        tickSize,
        tickFormat,
        font,
    } = settings.xAxis;

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = font;

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
            tickFormat(d),
            x,
            type === 'bottom'
                ? y + height + tickSize
                : y + height - (tickSize * 2),
        );
    });

    return ctx;
}

export function drawYAxis(ctx, parent, settings) {
    const {
        tickFormat,
        font,
    } = settings.yAxis;

    ctx.textAlign = 'right';
    ctx.font = font;

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

export function bindXAxisData(join, xScale, settings, height, y0) {
    const {
        xAxis,
        transition,
    } = settings;

    const width = xScale.range()[1];
    const x = (d) => xScale(join.identity(d)) + xScale.bandwidth() / 2;

    /*
        Create, update and remove x-axis
    */
    updateSelection({
        join: {
            ...join,
            cssClass: 'x-axis',
            data: join.data.length ? [0] : [],
        },
        enter: {
            fill: transparentize(xAxis.fill),
            x: 0,
            y: y0,
            width,
        },
        update: {
            fill: xAxis.fill,
            x: 0,
            y: y0,
            width,
        },
        exit: {
            fill: transparentize(xAxis.fill),
            y: y0,
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
            x,
            y: xAxis.type === 'bottom'
                ? xAxis.transform(height)
                : xAxis.transform(height) - xAxis.tickSize,
        },
        update: {
            fill: xAxis.fill,
            height: xAxis.tickSize,
            x,
            y: xAxis.type === 'bottom'
                ? xAxis.transform(height)
                : xAxis.transform(height) - xAxis.tickSize,
        },
        exit: {
            fill: transparentize(xAxis.fill),
            height: 0,
            y: xAxis.type === 'bottom'
                ? xAxis.transform(height)
                : xAxis.transform(height) - xAxis.tickSize,
        },
    }, transition);
}

export function bindYAxisData(join, yScale, settings, width) {
    const {
        yAxis,
        transition,
    } = settings;

    const height = yScale.range()[0];
    const y = typeof yScale.bandwidth === 'function'
        ? (d) => yScale(join.identity(d)) + yScale.bandwidth() / 2
        : (d) => yScale(d);

    /*
        Create, update and remove x-axis
    */
    updateSelection({
        join: {
            ...join,
            cssClass: 'y-axis',
            data: join.data.length ? [0] : [],
        },
        enter: {
            fill: transparentize(yAxis.fill),
            x: yAxis.transform(width),
            y: 0,
            height,
        },
        update: {
            fill: yAxis.fill,
            x: yAxis.transform(width),
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
            y,
        },
        update: {
            fill: yAxis.fill,
            width: yAxis.tickSize,
            x: 0,
            y,
        },
        exit: {
            fill: transparentize(yAxis.fill),
        },
    }, transition);
}
