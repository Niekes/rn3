import {
    timeFormat,
} from 'd3';

import defaults from '../../utils/default-settings';

export default {
    ...defaults,
    css: 'rn3-datepicker--default',
    maxDate: new Date(new Date().getFullYear() + 1, 0, 1),
    minDate: new Date(new Date().getFullYear(), 0, 1),
    activeMode: 'day',
    pages: 3,
    modes: {
        day: {
            render: d => timeFormat('%-e.%-m.%y')(d),
        },
        month: {
            render: d => timeFormat('%b \'%y')(d),
        },
        week: {
            render: d => timeFormat('%e. %b \'%y')(d),
        },
    },
    customPeriods: [],
    singleSelect: false,
};
