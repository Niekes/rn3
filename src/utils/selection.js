export function setMultiAttributes(selection, attrs) {
    if (!attrs) return selection;

    Object.keys(attrs).forEach((key) => {
        selection.attr(key, attrs[key]);
    });

    return selection;
}

export function setMultiStyles(selection, styles) {
    if (!styles) return selection;

    Object.keys(styles).forEach((key) => {
        selection.style(key, styles[key]);
    });

    return selection;
}
