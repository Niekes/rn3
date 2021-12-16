export function has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

export function isObject(object) {
    return typeof object === 'object' && Object.prototype.toString.call(object) === '[object Object]';
}

export function isEmpty(object) {
    return isObject(object) && Object.keys(object).length === 0;
}

export function mergeDeep(target, source) {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!(key in target)) Object.assign(output, { [key]: source[key] });
                else output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
