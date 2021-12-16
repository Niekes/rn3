import {
    select,
    create,
} from 'd3';

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

export function createContainer(el, id, cssClass) {
    return select(el)
        .append('div')
        .attr('id', id)
        .attr('class', cssClass)
        .style('height', '100%')
        .style('width', '100%');
}

export function createSelection(el, attrs, styles) {
    let element = create(el);

    element = setMultiAttributes(element, attrs);
    element = setMultiStyles(element, styles);

    return element;
}

export function appendSelection(parent, el, attrs, styles) {
    let element = parent.append(el);

    element = setMultiAttributes(element, attrs);
    element = setMultiStyles(element, styles);

    return element;
}

export function getChildrenFromSelection(parent, selector) {
    return parent.selectAll(selector);
}
