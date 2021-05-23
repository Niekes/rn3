import {
    create,
    select,
} from 'd3';

import {
    setMultiStyles,
} from './selection';

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
    const ib = setMultiStyles(
        create('div').attr('id', 'rn3-tooltip').style('pointer-events', 'none').style('position', 'absolute'),
        Object.assign(tooltip.styles || {}),
    );

    makeRow(ib.append('table').attr('id', 'rn3-tooltip__content'), tooltip);

    return ib;
}

export function setTooltip(data, x, y) {
    const tooltip = select('#rn3-tooltip');

    if (!tooltip.empty() || !tooltip) {
        tooltip.remove();
    }

    if (tooltip && data) {
        const tip = makeTooltip(data);

        document.body.appendChild(tip.node());

        console.log(tip.node().clientWidth);

        tip.style('left', `${x}px`);
        tip.style('top', `${y - tip.node().clientHeight - 12}px`);

        tip.style('display', null);
    }

    return 1;
}

export function unsetTooltip() {
    return select('#rn3-tooltip').remove();
}
