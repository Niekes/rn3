export const keyCodes = {
    alt: 18,
    backspace: 8,
    capsLock: 20,
    control: 17,
    down: 40,
    enter: 13,
    esc: 27,
    left: 37,
    metaLeft: 91,
    metaRight: 93,
    right: 39,
    shift: 16,
    tab: 9,
    up: 38,
};

export function isNavigatingVertically(code) {
    return code === keyCodes.up || code === keyCodes.down;
}

export function isNavigatingHorizontally(code) {
    return code === keyCodes.left || code === keyCodes.right;
}

export function isKey(code, key) {
    return keyCodes[key] === code;
}
