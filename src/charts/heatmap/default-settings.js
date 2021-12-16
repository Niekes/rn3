import defaults from '../../utils/default-settings.js';

export default {
    ...defaults,
    css: 'rn3-heatmap--default',
    margin: {
        bottom: 25,
        left: 25,
        right: 25,
        top: 25,
    },
    xAxis: {
        fill: '#000',
        font: '10px sans-serif',
        tickFormat: (d) => d,
        tickSize: 6,
        transform: () => 0,
        type: 'top',
    },
    yAxis: {
        fill: '#000',
        font: '10px sans-serif',
        tickFormat: (d) => d,
        tickSize: 6,
        transform: () => 0,
        type: 'left',
    },
    xScale: {
        domain: (values) => Array.from(new Set(values.map((d) => d.x))),
        padding: 0,
    },
    yScale: {
        domain: (values) => Array.from(new Set(values.map((d) => d.y))),
        padding: 0,
    },
};
