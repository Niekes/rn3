module.exports = {
    root: true,

    parser: 'babel-eslint',

    env: {
        browser: true,
    },

    extends: [
        'airbnb'
    ],

    rules: {
        'import/no-unresolved': [2, { ignore: ['$'] }],
        'indent': ['error', 4],
        'react/no-this-in-sfc': [0],
    },
}
