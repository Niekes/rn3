import { test } from 'tape';
import { select } from 'd3';
import { createCanvas, updateCanvas } from '../../src/utils/canvas';

test('Create and append canvas with correct attributes', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const canvas = createCanvas('#el', 'abc', 500, 750);

    t.equals(el.children.length, 1);
    t.equals(el.children[0].tagName, 'CANVAS');
    t.equals(canvas.attr('id'), 'abc');
    t.equals(+canvas.attr('height'), 1000);
    t.equals(+canvas.attr('width'), 1500);

    t.end();
});

test.only('Update canvas correctly', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    createCanvas('#el', 'abc', 500, 750);

    const canvasUpdate = updateCanvas('#el', 'abc', 1000, 1500);

    t.equals(el.children.length, 1);
    t.equals(el.children[0].tagName, 'CANVAS');
    t.equals(canvasUpdate.attr('id'), 'abc');
    t.equals(+canvasUpdate.attr('height'), 2000);
    t.equals(+canvasUpdate.attr('width'), 3000);

    t.end();
});
