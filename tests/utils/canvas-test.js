import { test } from 'tape';
import { select } from 'd3';
import { createCanvas } from '../../src/utils/canvas';

test('Create and append canvas with correct attributes', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const canvas = createCanvas('#el', '1234', 500, 750);

    t.equals(el.children.length, 1);
    t.equals(el.children[0].tagName, 'CANVAS');
    t.equals(canvas.attr('id'), '1234');
    t.equals(+canvas.attr('height'), 1000);
    t.equals(+canvas.attr('width'), 1500);

    t.end();
});
