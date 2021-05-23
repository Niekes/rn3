import { test } from 'tape';
import { has, isEmpty } from '../../src/utils/object';

test('Check whether an object contains a key or not', (t) => {
    const obj = {
        a: '1',
        b: null,
    };

    t.equals(has(obj, 'a'), true);
    t.equals(has(obj, 'b'), true);
    t.equals(has(obj, 'c'), false);

    t.end();
});

test('Check whether an object is empty', (t) => {
    const obj = {
        a: '1',
    };

    t.equals(isEmpty(obj), false);
    t.equals(isEmpty({}), true);

    t.end();
});
