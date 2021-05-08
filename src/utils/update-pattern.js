import {
    has,
} from './object';

export function setAttributes(selection, attrs) {
    if (!attrs) return selection;

    Object.keys(attrs).forEach((key) => {
        selection.attr(key, attrs[key]);
    });

    return selection;
}

export function updateSelection(d) {
    const {
        transition,
    } = this.settings;

    const el = d.join.element || 'custom';
    const css = d.join.cssClass;
    const identifier = has(d.join, 'identifier')
        ? d.join.identifier
        : this.getIdentifier;

    const joined = (d.join.parent || this.detachedContainer)
        .selectAll(`${el}.${css}`)
        .data(d.join.data, identifier);

    const s = setAttributes(
        joined
            .enter()
            .append(el),
        {
            ...d.enter,
            class: datum => (has(datum, 'css') && datum.css ? `${css} ${datum.css}` : css),
        },
    );

    setAttributes(
        s
            .merge(joined)
            .transition()
            .duration(transition.duration)
            .delay(transition.delay)
            .ease(transition.ease),
        d.update,
    );

    setAttributes(
        joined
            .exit()
            .transition()
            .duration(transition.duration)
            .delay(transition.delay)
            .ease(transition.ease),
        d.exit,
    ).remove();

    return {
        enter: joined.merge(s),
        exit: joined.exit(),
    };
}
