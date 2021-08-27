import {
    extent,
} from 'd3';

import defaults from '../../utils/default-settings';

export default {
    ...defaults,
    css: 'rn3-barchart--default',
    margin: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
    },
    xAxis: {
        fill: '#000',
        font: '10px sans-serif',
        tickFormat: d => d.id,
        tickSize: 6,
        transform: h => h,
        type: 'bottom',
    },
    yAxis: {
        fill: '#000',
        font: '10px sans-serif',
        tickFormat: d => d,
        ticks: 3,
        tickSize: 6,
        transform: () => 0,
        type: 'left',
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
