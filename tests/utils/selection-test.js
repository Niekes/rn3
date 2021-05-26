import { test } from 'tape';
import { select } from 'd3';
import { setMultiAttributes, setMultiStyles } from '../../src/utils/selection';

test('Set multi attributes', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const selection = setMultiAttributes(
        select('#el'),
        {
            'data-test': 1,
            width() {
                return '1234px';
            },
        },
    );

    t.equals(selection.attr('data-test'), '1');
    t.equals(selection.attr('width'), '1234px');

    t.end();
});

test('Set multi styles', (t) => {
    select('body').html(null);

    const el = document.createElement('div');

    el.setAttribute('id', 'el');

    el.style.height = '500px';
    el.style.width = '750px';

    document.body.appendChild(el);

    const selection = setMultiStyles(
        select('#el'),
        {
            background: 'green',
            'z-index': function _() {
                return 1000;
            },
        },
    );

    t.equals(selection.style('background'), 'green');
    t.equals(selection.style('z-index'), '1000');

    t.end();
});
