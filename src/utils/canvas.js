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

export function drawXAxis() {
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';

    const {
        tickSize,
        tickFormat,
    } = this.settings.xAxis;

    const xTicks = this.detachedContainer.selectAll('custom.x-ticks');

    xTicks.each((d, i, nodes) => {
        const node = select(nodes[i]);
        const x = +node.attr('x');
        const y = +node.attr('y');
        const height = +node.attr('height');
        const fill = node.attr('fill');

        this.context.beginPath();
        this.context.fillStyle = fill;
        this.context.moveTo(x, y);
        this.context.lineTo(x, y + height);
        this.context.strokeStyle = fill;
        this.context.stroke();
        this.context.fillText(
            tickFormat(d.id),
            x,
            d.value > 0
                ? y + height + tickSize
                : y + height - (tickSize * 2),
        );
    });
}

export function drawYAxis() {
    this.context.textAlign = 'right';

    const { margin, yAxis } = this.settings;
    const { tickFormat, fill } = yAxis;

    const yTicks = this.detachedContainer.selectAll('custom.y-ticks');

    this.context.moveTo(
        0,
        margin.top - margin.bottom - 0.5,
    );
    this.context.lineTo(
        0,
        margin.top - margin.bottom + this.height + 0.5,
    );
    this.context.strokeStyle = fill;
    this.context.stroke();

    yTicks.each((d, i, nodes) => {
        const node = select(nodes[i]);
        const x = +node.attr('x');
        const y = +node.attr('y');
        const width = +node.attr('width');
        const fillStyle = node.attr('fill');

        this.context.beginPath();
        this.context.fillStyle = fillStyle;
        this.context.strokeStyle = fillStyle;
        this.context.moveTo(x, y);
        this.context.lineTo(x - width, y);
        this.context.stroke();
        this.context.fillText(
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
