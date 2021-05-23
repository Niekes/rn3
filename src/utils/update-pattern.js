import {
    setMultiAttributes,
} from './selection';

// eslint-disable-next-line import/prefer-default-export
export function updateSelection(d, transition) {
    const el = d.join.element || 'custom';
    const css = d.join.cssClass;

    const joined = d.join.parent
        .selectAll(`${el}.${css}`)
        .data(d.join.data, d.join.identity);

    const s = setMultiAttributes(
        joined
            .enter()
            .append(el),
        {
            ...d.enter,
            class: css,
        },
    );

    setMultiAttributes(
        s
            .merge(joined)
            .transition()
            .duration(transition.duration)
            .delay(transition.delay)
            .ease(transition.ease),
        d.update,
    );

    setMultiAttributes(
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
