/**
*   @param {date} date
*   @returns {boolean}
*/
export function isValidDate(date) {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        if (Number.isNaN(date.getTime())) {
            return false;
        }
        return true;
    }
    return false;
}

/**
*   @param {date} date
*   @returns {date} date where hours were set to 0
*/
export function normalizeHours(date) {
    return date.setHours(0, 0, 0, 0);
}

/**
*   @param {date} date
*   @returns {date}
*/
export function getFirstOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
*   @param {date} date
*   @returns {date}
*/
export function getLastOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
*   @param {date} date
*   @returns {number} Amount of days in given month and year
*/
export function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
*   @param {date} date
*   @returns {number} Amount of iso weeks in given year
*/
export function getISOWeeks(date) {
    const year = date.getFullYear();
    const d = new Date(year, 0, 1);
    const isLeap = new Date(year, 1, 29).getMonth() === 1;

    return (d.getDay() === 4) || (isLeap && d.getDay()) === 3 ? 53 : 52;
}

/**
*   @param {number} year (e.g. 2019)
*   @param {number} week
*   @returns {date} Monday of that week
*/
export function getDateByWeek(week, year) {
    return new Date(week, 0, (1 + (year - 1) * 7));
}

export function getDateOfISOWeek(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const isoWeekStart = simple;

    if (dow <= 4) {
        isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return isoWeekStart;
}
