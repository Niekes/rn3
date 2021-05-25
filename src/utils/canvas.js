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
        .attr('width', width * 2)
        .style('height', '100%')
        .style('width', '100%');
}
export function updateVirtualCanvas(virtualCanvas, height, width) {
    return virtualCanvas
        .attr('height', height * 2)
        .attr('width', width * 2)
        .style('height', '100%')
        .style('width', '100%');
}

export function clearCanvas(ctx, margin, height, width) {
    ctx.clearRect(
        -margin.left,
        -margin.top,
        width * 2,
        height * 2,
    );

    ctx.fill();

    return ctx;
}

export function render(fn, duration) {
    const t = timer((elapsed) => {
        fn();

        if (elapsed > duration) {
            t.stop();
        }
    });
}

export function renderOnVirtualCanvas(fn, duration) {
    window.setTimeout(() => {
        fn();
    }, duration);
}
