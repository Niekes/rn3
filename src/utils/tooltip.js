import {
    create,
    select,
} from 'd3';

import {
    setMultiStyles,
} from './selection';

const TOLERANCE = 1.02;
const SPACING = 20;

export function makeRow(el, tooltip) {
    const row = create('tr')
        .attr('class', 'rn3-tooltip__row');

    tooltip.data.forEach((tt) => {
        if (Array.isArray(tt)) {
            makeRow(el, { data: tt });
        }

        if (!Array.isArray(tt)) {
            select(row.node())
                .append('td')
                .attr('class', 'rn3-tooltip__cell')
                .html(tt);

            el.node().appendChild(row.node());
        }
    });
}

export function makeTooltip(tooltip) {
    const tt = setMultiStyles(
        create('div').attr('id', 'rn3-tooltip').style('pointer-events', 'none').style('position', 'absolute'),
        Object.assign(tooltip.styles || {}),
    );

    makeRow(tt.append('table').attr('id', 'rn3-tooltip__content'), tooltip);

    return tt;
}

export function setLeft(x, w) {
    if ((x + w * TOLERANCE) > window.innerWidth) {
        return `${(x - w)}px`;
    }

    return `${x}px`;
}

export function setTop(y, h) {
    const { innerHeight } = window;

    if (innerHeight - y + (h * TOLERANCE) + (SPACING * 1.25) > innerHeight) {
        return `${(y + SPACING * 1.5)}px`;
    }

    return `${(y - h - SPACING)}px`;
}

export function setTooltip(data, x, y) {
    const tooltip = select('#rn3-tooltip');

    if (!tooltip.empty() || !tooltip) {
        tooltip.remove();
    }

    if (data && x && y) {
        const tip = makeTooltip(data);

        document.body.appendChild(tip.node());

        tip.style('left', setLeft(x, tip.node().offsetWidth));
        tip.style('top', setTop(y, tip.node().offsetHeight));
    }
}

export function unsetTooltip() {
    return select('#rn3-tooltip').remove();
}
