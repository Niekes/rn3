import {
    isObject,
} from './object';

export function isArray(array) {
    return Array.isArray(array) && Object.prototype.toString.call(array) === '[object Array]';
}

export function isEmpty(array) {
    return isArray(array) && array.length === 0;
}

export function isArrayOfObjects(array) {
    return isArray(array) && !isEmpty(array) && array.every(arr => isObject(arr));
}
