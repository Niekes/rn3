import {
    select,
} from 'd3';

export function getHeight(el) {
    return select(el).node().clientHeight || Number.parseInt(select(el).style('height'), 10);
}

export function getWidth(el) {
    return select(el).node().clientWidth || Number.parseInt(select(el).style('width'), 10);
}

export function computeInnerHeight(height, margin) {
    return height - margin.top - margin.bottom;
}

export function computeInnerWidth(width, margin) {
    return width - margin.left - margin.right;
}
