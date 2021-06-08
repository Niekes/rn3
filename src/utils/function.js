// eslint-disable-next-line import/prefer-default-export
export const debounce = (func, wait) => {
    let timeout;

    return function _(...args) {
        const later = () => {
            timeout = null;

            func.apply(this, args);
        };

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);
    };
};
