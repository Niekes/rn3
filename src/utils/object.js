export function has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

export function isEmpty(object) {
    return object
        && Object.keys(object).length === 0
        && object.constructor === Object;
}
