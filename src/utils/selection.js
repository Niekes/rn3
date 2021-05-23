// eslint-disable-next-line import/prefer-default-export
export function setMultiAttributes(selection, attrs) {
    if (!attrs) return selection;

    Object.keys(attrs).forEach((key) => {
        selection.attr(key, attrs[key]);
    });

    return selection;
}
