import {
    select,
} from 'd3';

export function computeWidth(el) {
    return Math.floor((el.clientWidth || Number.parseInt(select(el).style('width'), 10)));
}

export function computeInnerWidth(width, margin) {
    return width - margin.left - margin.right;
}

export function computeHeight(el) {
    return Math.floor((el.clientHeight || Number.parseInt(select(el).style('height'), 10)));
}

export function computeInnerHeight(height, margin) {
    return height - margin.top - margin.bottom;
}
