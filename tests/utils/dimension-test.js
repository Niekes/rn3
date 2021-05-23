import { test } from 'tape';
import { select } from 'd3';
import {
    getHeight,
    getWidth,
    computeInnerHeight,
    computeInnerWidth,
} from '../../src/utils/dimension';

test.only('Passed color is transparentized', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const height = 500;
    const width = 600;
    const margin = {
        bottom: 10,
        left: 15,
        right: 20,
        top: 5,
    };

    t.equals(getHeight(document.querySelector('#el')), 500);
    t.equals(getWidth(document.querySelector('#el')), 750);
    t.equals(computeInnerHeight(height, margin), 485);
    t.equals(computeInnerWidth(width, margin), 565);

    t.end();
});
