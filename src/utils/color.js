import {
    color,
    lab,
} from 'd3';

export function transparentize(c, o = 0) {
    const rgb = color(c);

    rgb.opacity = o;

    return rgb;
}

export function getContrast(c, threshold = 50) {
    if (lab(c).l < threshold) {
        return '#fff';
    }

    return '#000';
}
