import { test } from 'tape';
import { easeCubic } from 'd3';
import defaultsettings from '../../src/utils/default-settings';

test('Default settings are set correctly', (t) => {
    t.equals(defaultsettings.identity, 'id');
    t.equals(defaultsettings.transition.delay, null);
    t.equals(defaultsettings.transition.duration, 450);
    t.equals(defaultsettings.transition.ease, easeCubic);
    t.end();
});
