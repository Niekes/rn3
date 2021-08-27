export function isValidDate(date) {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        if (Number.isNaN(date.getTime())) {
            return false;
        }

        return true;
    }

    return false;
}

export function normalizeHours(date) {
    return date.setHours(0, 0, 0, 0);
}
