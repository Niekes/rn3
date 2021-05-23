import { test } from 'tape';
import { select } from 'd3';
import {
    createCanvas,
    updateCanvas,
    clearCanvas,
} from '../../src/utils/canvas';

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

test('Update canvas correctly', (t) => {
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

test('Clear canvas correctly', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const canvas = createCanvas('#el', 'abc', 500, 750);
    const ctx = canvas.node().getContext('2d');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(750, 500);
    ctx.stroke();

    clearCanvas(
        ctx,
        {
            top: 0, left: 0, bottom: 0, right: 0,
        },
        500,
        750,
    );

    const isEmpty = !ctx
        .getImageData(0, 0, 750, 500).data
        .some(channel => channel !== 0);

    t.equals(isEmpty, true);

    t.end();
});
