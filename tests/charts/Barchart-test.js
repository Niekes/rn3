import { test } from 'tape';
import { select } from 'd3';
import Barchart from '../../src/charts/barchart';

test('Barchart should be initialzed correctly', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const barchart = new Barchart({
        el: '#el',
        settings: {
            identity: 'id',
        },
    });

    t.equals(barchart.settings.css, '');
    t.equals(barchart.tooltipData.size, 0);
    t.equals(barchart instanceof Barchart, true);
    t.deepEquals(barchart.events, {});
    t.equals(Object.keys(barchart.events).length, 0);
    t.equals(barchart.canvas.attr('height'), '1000');
    t.equals(barchart.canvas.attr('width'), '1500');
    t.equals(barchart.canvas.empty(), false);
    t.equals(barchart.canvas.size(), 1);
    t.equals(barchart.virtualContext.strokeStyle, '#000000');
    t.equals(barchart.width, 750);
    t.equals(barchart.height, 500);
    t.equals(typeof barchart.virtualContext.beginPath, 'function');
    t.equals(typeof barchart.virtualContext.moveTo, 'function');
    t.equals(typeof barchart.virtualContext.lineTo, 'function');
    t.equals(typeof barchart.virtualContext.stroke, 'function');
    t.equals(typeof barchart.virtualContext.fill, 'function');
    t.equals(barchart.settings.margin.bottom, 0);
    t.equals(barchart.settings.margin.top, 0);
    t.equals(barchart.settings.margin.left, 0);
    t.equals(barchart.settings.margin.right, 0);
    t.equals(typeof barchart.virtualContext, 'object');
    t.equals(typeof barchart.on, 'function');
    t.equals(typeof barchart.off, 'function');
    t.equals(typeof barchart.dispatch, 'function');
    t.equals(typeof barchart.ioObserve, 'function');
    t.equals(typeof barchart.ioDisconnect, 'function');
    t.equals(typeof barchart.getFill, 'function');
    t.equals(typeof barchart.getFillTransparentized, 'function');
    t.equals(typeof barchart.getIdentity, 'function');
    t.equals(typeof barchart.mergeSettings, 'function');
    t.equals(/^rn3-barchart-\w{5}$/.test(barchart.id), true);

    t.end();
});

test.only('Barchart standard methods work correctly', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const barchart = new Barchart({
        el: '#el',
        settings: {
            identity: 'id',
        },
    });

    barchart.update({
        values: [
            { id: 'b', value: 2, fill: 'deeppink' },
            { id: 'a', value: 1, fill: 'skyblue' },
            { id: 'c', value: 3, fill: 'crimson' },
            { id: 'e', value: -5, fill: 'violet' },
            { id: 'f', value: -6, fill: 'darkblue' },
        ],
    });

    t.equals(barchart.getYScale0(), 166.66666666666669);
    t.equals(barchart.getXPositionOfBars({ id: 'c' }), 308.8235294117647);
    t.equals(barchart.getXPositionOfBars({ id: 'f' }), 602.9411764705882);
    t.equals(barchart.getYPositionOfBars({ value: 1 }), 111.1111111111111);
    t.equals(barchart.getYPositionOfBars({ value: 0 }), 166.66666666666669);
    t.equals(barchart.getWidthOfBars(), 132.35294117647058);
    t.equals(barchart.getHeightOfBars({ value: 1 }), 55.555555555555586);
    t.equals(barchart.getHeightOfBars({ value: 0 }), 0);
    t.end();
});
