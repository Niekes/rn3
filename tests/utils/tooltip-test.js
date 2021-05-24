import { test } from 'tape';
import { select } from 'd3';
import {
    setLeft,
    setTop,
    setTooltip,
    unsetTooltip,
} from '../../src/utils/tooltip';

test('Top offset of tooltip', (t) => {
    select('body').html(null);

    const tooltip = {
        data: [1, 2, 3],
    };

    setTooltip(tooltip, 0, 0);

    const tt = document.querySelector('#rn3-tooltip');

    t.equals(tt.children.length, 1);
    t.end();
});

test('Top offset of tooltip', (t) => {
    select('body').html(null);

    t.equals(setTop(0, 100), '30px');
    t.equals(setTop(500, 100), '380px');
    t.equals(setTop(700, 100), '580px');
    t.end();
});

test('Left offset of tooltip', (t) => {
    select('body').html(null);

    t.equals(setLeft(0, 100), '0px');
    t.equals(setLeft(500, 100), '500px');
    t.equals(setLeft(1000, 100), '900px');
    t.end();
});

test('Tooltip is removed correctly', (t) => {
    select('body').html(null);

    const tt = document.createElement('div');

    tt.setAttribute('id', 'rn3-tooltip');

    tt.innerHTML = 'tooltip content';

    document.body.appendChild(tt);

    unsetTooltip();

    t.equals(document.querySelector('#rn3-tooltip'), null);
    t.end();
});
