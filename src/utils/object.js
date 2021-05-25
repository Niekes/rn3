export function has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

export function isEmpty(object) {
    return object
        && Object.keys(object).length === 0
        && object.constructor === Object;
}

export function isObject(object) {
    return typeof object === 'object' && Object.prototype.toString.call(object) === '[object Object]';
}

export function mergeDeep(source, target) {
    const merged = Object.assign({}, target);

    if (!isObject(target) && isObject(source)) {
        return source;
    }

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if ((key in target)) {
                    merged[key] = mergeDeep(target[key], source[key]);
                }

                if (!(key in target)) {
                    Object.assign(merged, { [key]: source[key] });
                }
            }

            if (!isObject(source[key])) {
                Object.assign(merged, { [key]: source[key] });
            }
        });
    }

    return merged;
}
