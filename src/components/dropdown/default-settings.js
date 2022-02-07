import defaults from '../../utils/default-settings.js';

export default {
    ...defaults,
    css: 'rn3-dropdown--default',
    form: {
        placeholder: 'Type to search',
        arrow: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M.14 5.242 11.63 19.645c.187.238.59.238.781 0L23.898 5.242a.725.725 0 0 0 .106-.652c-.016-.047-.035-.082-.047-.11a.504.504 0 0 0-.441-.265H.523a.5.5 0 0 0-.441.265.695.695 0 0 0 .059.762Zm0 0"/></svg>',
        item: {
            render: (d) => d.id,
        },
    },
    dropdown: {
        item: {
            render: (d) => d.id,
            clickToSelect: 'Click to select',
            clickToRemove: 'Click to remove',
            enterToSelect: 'Enter to select',
            enterToRemove: 'Enter to remove',
        },
    },
};
