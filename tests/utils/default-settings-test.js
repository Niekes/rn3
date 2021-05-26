import { test } from 'tape';
import { easeCubic } from 'd3';
import defaultsettings from '../../src/utils/default-settings';

test('Default settings are set correctly', (t) => {
    t.equals(defaultsettings.css, '');
    t.equals(defaultsettings.identity, 'id');
    t.equals(defaultsettings.margin.top, 0);
    t.equals(defaultsettings.margin.left, 0);
    t.equals(defaultsettings.margin.bottom, 0);
    t.equals(defaultsettings.margin.right, 0);
    t.equals(defaultsettings.transition.delay, null);
    t.equals(defaultsettings.transition.duration, 450);
    t.equals(defaultsettings.transition.ease, easeCubic);
    t.equals(defaultsettings.intersectionObserverOptions, null);
    t.end();
});
