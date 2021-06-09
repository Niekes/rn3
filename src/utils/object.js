export function has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

export function isObject(object) {
    return typeof object === 'object' && Object.prototype.toString.call(object) === '[object Object]';
}

export function isEmpty(object) {
    return isObject(object) && Object.keys(object).length === 0;
}

export function mergeDeep(source, target) {
    const merged = Object.assign({}, target);

    if (!isObject(target) && isObject(source)) {
        return source;
    }

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            const value = source[key];

            if (isObject(value)) {
                if (has(target, key)) {
                    merged[key] = mergeDeep(target[key], value);
                }

                if (!has(target, key)) {
                    Object.assign(merged, { [key]: value });
                }
            }

            if (!isObject(value)) {
                Object.assign(merged, { [key]: value });
            }
        });
    }

    return merged;
}
