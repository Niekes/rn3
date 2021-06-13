import {
    extent,
} from 'd3';

import defaults from '../../utils/default-settings';

export default {
    ...defaults,
    css: 'rn3-barchart--default',
    xAxis: {
        fill: '#000',
        font: '10px sans-serif',
        tickFormat: d => d,
        tickSize: 6,
    },
    yAxis: {
        fill: '#000',
        font: '10px sans-serif',
        tickFormat: d => d,
        ticks: 3,
        tickSize: 6,
    },
    xScale: {
        domain: values => values.map(d => d.id),
        padding: 0.1,
    },
    yScale: {
        domain(values) {
            const ext = extent(values, d => d.value);

            return [
                Math.min(0, ext[0]),
                Math.max(0, ext[1]),
            ];
        },
    },
};
