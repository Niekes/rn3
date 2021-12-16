import defaults from '../../utils/default-settings.js';

export default {
    ...defaults,
    css: 'rn3-dropdown--default',
    form: {
        placeholder: 'Type...',
    },
    dropdown: {
        item: {
            render: (d) => d.id,
        },
    },
};
