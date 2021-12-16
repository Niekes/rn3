import { test } from 'tape';
import { select } from 'd3';
import Chart from '../../src/charts/Chart.js';

test('Super class of all charts should be initialzed correctly', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const chart = new Chart({
        el: '#el',
        settings: {
            identity: 'id',
            margin: {
                top: 0, left: 0, right: 0, bottom: 0,
            },
        },
    });

    t.equals(chart.tooltipData.size, 0);
    t.equals(chart instanceof Chart, true);
    t.deepEquals(chart.events, undefined);
    t.equals(chart.canvas.attr('height'), '1000');
    t.equals(chart.canvas.attr('width'), '1500');
    t.equals(chart.canvas.empty(), false);
    t.equals(chart.canvas.size(), 1);
    t.equals(chart.virtualContext.strokeStyle, '#000000');
    t.equals(chart.width, 750);
    t.equals(chart.height, 500);
    t.equals(typeof chart.virtualContext.beginPath, 'function');
    t.equals(typeof chart.virtualContext.moveTo, 'function');
    t.equals(typeof chart.virtualContext.lineTo, 'function');
    t.equals(typeof chart.virtualContext.stroke, 'function');
    t.equals(typeof chart.virtualContext.fill, 'function');
    t.equals(chart.settings.margin.bottom, 0);
    t.equals(chart.settings.margin.top, 0);
    t.equals(chart.settings.margin.left, 0);
    t.equals(chart.settings.margin.right, 0);
    t.equals(typeof chart.virtualContext, 'object');
    t.equals(typeof chart.on, 'function');
    t.equals(typeof chart.off, 'function');
    t.equals(typeof chart.dispatch, 'function');
    t.equals(typeof chart.getFill, 'undefined');
    t.equals(typeof chart.getFillTransparentized, 'undefined');
    t.equals(typeof chart.getIdentity, 'function');
    t.equals(typeof chart.mergeSettings, 'undefined');
    t.equals(/^rn3-chart-\w{5}$/.test(chart.id), true);

    t.end();
});

test('Super class event bus works correctly', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const chart = new Chart({
        el: '#el',
        settings: {
            identity: 'id',
            margin: {
                top: 0, left: 0, right: 0, bottom: 0,
            },
        },
    });

    t.equals(Object.keys(chart.on('test-event', d => d)).length, 1);
    t.equals(chart.dispatch('test-event', 1), 1);
    t.equals(Object.keys(chart.off('test-event')).length, 0);
    t.equals(Object.keys(chart.on('test-event-1', d => d)).length, 1);
    t.equals(Object.keys(chart.on('test-event-2', d => d)).length, 2);
    t.equals(Object.keys(chart.on('test-event-3', d => d)).length, 3);
    t.equals(Object.keys(chart.off()).length, 0);

    t.end();
});
