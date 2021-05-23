import {
    color,
    lab,
    rgb,
} from 'd3';

export function transparentize(c, o = 0) {
    const rgbColor = color(c);

    rgbColor.opacity = o;

    return rgbColor;
}

export function getContrast(c, threshold = 50) {
    if (lab(c).l < threshold) {
        return '#fff';
    }

    return '#000';
}

export function getUniqueColorByIndex(index) {
    return rgb(
        // eslint-disable-next-line no-bitwise
        (index & 0b111111110000000000000000) >> 16,
        // eslint-disable-next-line no-bitwise
        (index & 0b000000001111111100000000) >> 8,
        // eslint-disable-next-line no-bitwise
        (index & 0b000000000000000011111111),
    )
        .toString();
}
