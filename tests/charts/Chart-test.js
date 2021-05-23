import { test } from 'tape';
import { select } from 'd3';
import Chart from '../../src/charts/Chart';

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
            margin: {
                top: 0, left: 0, right: 0, bottom: 0,
            },
        },
    });

    chart.on('test-event', () => 1);

    const testReturn = chart.dispatch('test-event');

    t.equals(chart.width, 750);
    t.equals(chart.height, 500);
    t.equals(chart.settings.margin.bottom, 0);
    t.equals(chart.settings.margin.top, 0);
    t.equals(chart.settings.margin.left, 0);
    t.equals(chart.settings.margin.right, 0);
    t.equals(typeof chart.on, 'function');
    t.equals(typeof chart.off, 'function');
    t.equals(typeof chart.dispatch, 'function');
    t.equals(typeof chart.ioObserve, 'function');
    t.equals(typeof chart.ioDisconnect, 'function');
    t.equals(typeof chart.getFill, 'function');
    t.equals(typeof chart.getFillTransparentized, 'function');
    t.equals(typeof chart.getIdentity, 'function');
    t.equals(typeof chart.mergeSettings, 'function');
    t.equals(/^rn3-chart-\w{5}$/.test(chart.id), true);
    t.equals(testReturn, 1);

    t.end();
});
