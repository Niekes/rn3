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

export function render(fn, duration) {
    const t = timer((elapsed) => {
        fn();

        if (elapsed > duration) {
            t.stop();
        }
    });
}
