import { test } from 'tape';
import {
    has, isEmpty, mergeDeep, isObject,
} from '../../src/utils/object';

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

test.only('Check whether an object is an object', (t) => {
    t.equals(isObject({}), true);
    t.equals(isObject({ test: 1 }), true);
    t.equals(isObject(null), false);
    t.equals(isObject(1), false);
    t.end();
});

test('Check whether two objects were merged deeply', (t) => {
    const source = {
        a: '1',
        margin: {
            top: 10,
            left: 12,
            bottom: 5,
            right: 7.5,
        },
    };

    const target = {
        a: '1',
        margin: {
            left: 25,
        },
    };

    const merged = mergeDeep(source, target);

    t.equals(merged.a, '1');
    t.equals(merged.margin.top, 10);
    t.equals(merged.margin.left, 25);
    t.equals(merged.margin.bottom, 5);
    t.equals(merged.margin.right, 7.5);

    t.end();
});
