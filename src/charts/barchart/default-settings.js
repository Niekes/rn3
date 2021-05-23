import {
    extent,
} from 'd3';

import defaults from '../../utils/default-settings';

export default {
    ...defaults,
    xAxis: {
        fill: '#000',
        tickFormat: d => d,
        tickSize: 6,
        transform: h => ({ x: 0, y: h }),
    },
    yAxis: {
        fill: '#000',
        tickFormat: d => d,
        ticks: 3,
        tickSize: 6,
        transform: () => ({ x: 0, y: 0 }),
    },
    xScale: {
        domain: values => values.map(d => d.id),
        padding: 0.1,
        type: 'band',
    },
    yScale: {
        domain(values) {
            const ext = extent(values, d => d.value);

            return [
                Math.min(0, ext[0]),
                Math.max(0, ext[1]),
            ];
        },
        type: 'linear',
    },
};
