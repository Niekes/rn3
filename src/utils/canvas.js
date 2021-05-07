import {
    create,
    select,
} from 'd3';

import {
    computeWidth,
    computeHeight,
} from './dimension';

import uuid from './uuid';

export function addCanvas() {
    const {
        el,
    } = this.data;

    const id = uuid(`rn3-${this.constructor.name}`).toLowerCase();
    const height = computeHeight.call(this, el);
    const width = computeWidth.call(this, el);

    this.id = `#${id}`;
    this.width = width.inner;
    this.height = height.inner;

    return select(el)
        .append('canvas')
        .attr('id', id)
        .attr('height', height.outer)
        .attr('width', width.outer)
        .style('height', '100%')
        .style('width', '100%');
}


export function createVirtualCanvas() {
    return create('canvas')
        .attr('id', `${this.id}--virtual`)
        .attr('height', this.height)
        .attr('width', this.width)
        .style('height', '100%')
        .style('width', '100%');
}

export function updateCanvas() {
    const {
        el,
    } = this.data;

    const height = computeHeight.call(this, el);
    const width = computeWidth.call(this, el);

    this.width = width.inner;
    this.height = height.inner;

    return select(el)
        .select(this.id)
        .attr('height', height.outer)
        .attr('width', width.outer);
}
