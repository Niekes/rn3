/**
    @params {string} prefix
    @returns {string} five-charcaters random string
*/
export default function uuid(prefix) {
    const randomString = Math
        .random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substring(2, 10)
        .substring(0, 5);

    if (randomString.length < 5) {
        return uuid(prefix);
    }

    return `${prefix}-${randomString}`;
}
