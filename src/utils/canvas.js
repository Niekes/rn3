import {
    create,
    timer,
    select,
} from 'd3';

export function createCanvas(el, id, height, width) {
    return select(el)
        .append('canvas')
        .attr('id', id)
        .attr('height', height * 2)
        .attr('width', width * 2)
        .style('height', '100%')
        .style('width', '100%');
}

export function createVirtualCanvas(id, height, width) {
    return create('canvas')
        .attr('id', `${id}--virtual`)
        .attr('height', height * 2)
        .attr('width', width * 2)
        .style('height', '100%')
        .style('width', '100%');
}

export function updateCanvas(el, id, height, width) {
    return select(el)
        .select(`#${id}`)
        .attr('height', height * 2)
        .attr('width', width * 2);
}

export function drawXAxis(ctx, ticks, settings) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const {
        tickSize,
        tickFormat,
    } = settings.xAxis;

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
}

export function drawYAxis(ctx, ticks, settings, height) {
    ctx.textAlign = 'right';

    const { margin, yAxis } = settings;
    const { tickFormat, fill } = yAxis;

    ctx.moveTo(
        0,
        margin.top - margin.bottom - 0.5,
    );
    ctx.lineTo(
        0,
        margin.top - margin.bottom + height + 0.5,
    );
    ctx.strokeStyle = fill;
    ctx.stroke();

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
}

export function render(fn, duration) {
    const t = timer((elapsed) => {
        fn();

        if (elapsed > duration) {
            t.stop();
        }
    });
}
