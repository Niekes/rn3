import { test } from 'tape';
import {
    isEmpty, isArray, isArrayOfObjects,
} from '../../src/utils/array';

test('Check whether an array is an array', (t) => {
    t.equals(isArray(1), false);
    t.equals(isArray(null), false);
    t.equals(isArray(new Date()), false);
    t.equals(isArray([]), true);
    t.equals(isArray([1, 2, 3]), true);

    t.end();
});

test.only('Check whether an array is emty', (t) => {
    t.equals(isEmpty([]), true);
    t.equals(isEmpty([1, 2, 3]), false);

    t.end();
});

test('Check whether an array is array objects', (t) => {
    t.equals(isArrayOfObjects(null), false);
    t.equals(isArrayOfObjects(new Date()), false);
    t.equals(isArrayOfObjects([new Date(), new Date(), new Date()]), false);
    t.equals(isArrayOfObjects([]), false);
    t.equals(isArrayOfObjects([1, 2, 3]), false);

    t.end();
});
