import { test } from 'tape';
import { easeCubic } from 'd3';
import defaultsettings from '../../src/charts/barchart/default-settings.js';

test('Barchart default settings are set correctly', (t) => {
    t.equals(defaultsettings.css, 'rn3-barchart--default');
    t.equals(defaultsettings.identity, 'id');
    t.equals(defaultsettings.margin.top, 0);
    t.equals(defaultsettings.margin.left, 0);
    t.equals(defaultsettings.margin.bottom, 0);
    t.equals(defaultsettings.margin.right, 0);
    t.equals(defaultsettings.transition.delay, null);
    t.equals(defaultsettings.transition.duration, 450);
    t.equals(defaultsettings.transition.ease, easeCubic);
    t.equals(defaultsettings.xAxis.fill, '#000');
    t.equals(defaultsettings.xAxis.font, '10px sans-serif');
    t.equals(defaultsettings.xAxis.tickSize, 6);
    t.equals(defaultsettings.yAxis.fill, '#000');
    t.equals(defaultsettings.yAxis.font, '10px sans-serif');
    t.equals(defaultsettings.yAxis.tickFormat(1), 1);
    t.equals(defaultsettings.yAxis.tickSize, 6);
    t.equals(defaultsettings.yAxis.ticks, 3);
    t.equals(defaultsettings.xScale.padding, 0.1);
    t.deepEquals(defaultsettings.xScale.domain([{ id: 'A' }, { id: 'B' }, { id: 'C' }]), ['A', 'B', 'C']);
    t.deepEquals(
        defaultsettings.yScale.domain([{ value: 0 }, { value: 45 }, { value: 99 }]),
        [0, 99],
    );
    t.end();
});
