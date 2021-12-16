import { test } from 'tape';
import { select, easeCubic } from 'd3';
import { updateSelection } from '../../src/utils/update-pattern.js';

test('updateSelection', (t) => {
    select('body').html(null);

    const datum = {
        join: {
            cssClass: 'bars',
            data: [{ id: 'a', value: 0 }],
            identity: (d) => d.id,
            parent: select('body'),
        },
        enter: {
            x: 1,
            y: 0,
        },
        update: {
            x: 1,
            y: 0,
        },
        exit: {
            x: 1,
            y: 0,
        },
    };

    const transition = {
        delay: null,
        duration: 450,
        ease: easeCubic,
    };

    const selection = updateSelection(datum, transition);

    t.equals(selection.enter.empty(), false);
    t.equals(selection.exit.empty(), true);

    t.end();
});
