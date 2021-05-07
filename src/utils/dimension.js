import {
    select,
} from 'd3';

export function computeWidth(el) {
    const width = Math.floor((el.clientWidth || Number.parseInt(select(el).style('width'), 10))) * 2;

    return {
        outer: width,
        inner: (width / 2) - this.settings.margin.left - this.settings.margin.right,
    };
}

export function computeHeight(el) {
    const height = Math.floor((el.clientHeight || Number.parseInt(select(el).style('height'), 10))) * 2;

    return {
        outer: height,
        inner: (height / 2) - this.settings.margin.top - this.settings.margin.bottom,
    };
}
