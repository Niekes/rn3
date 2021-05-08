// eslint-disable-next-line import/prefer-default-export
export function has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}
