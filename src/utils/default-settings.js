import {
    easeCubic,
} from 'd3';

export default {
    css: '',
    errorMsg: 'no data',
    identity: 'id',
    margin: {
        bottom: 30,
        left: 30,
        right: 30,
        top: 30,
    },
    transition: {
        delay: null,
        duration: 450,
        ease: easeCubic,
    },
    intersectionObserverOptions: null,
};
