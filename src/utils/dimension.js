import {
    select,
} from 'd3';

export function getHeight(el) {
    return Math.floor((el.clientHeight || Number.parseInt(select(el).style('height'), 10)));
}

export function getWidth(el) {
    return Math.floor((el.clientWidth || Number.parseInt(select(el).style('width'), 10)));
}

export function computeInnerHeight(height, margin) {
    return height - margin.top - margin.bottom;
}

export function computeInnerWidth(width, margin) {
    return width - margin.left - margin.right;
}
