import {
    timeFormat,
} from 'd3';

import defaults from '../../utils/default-settings';

export default {
    ...defaults,
    css: 'rn3-datepicker--default',
    minDate: new Date(new Date().getFullYear(), 0, 1),
    maxDate: new Date(new Date().getFullYear(), 11, 31),
    activeMode: 'day',
    pages: 3,
    form: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M16.91 3.191V.758h-1.82V3.19H8.91V.758H7.09V3.19H0v3.95h24V3.19ZM0 23.242h24V8.961H0Zm15.95-11.394h3.038v3.039H15.95Zm0 5.468h3.038v3.04H15.95Zm-5.47-5.468h3.04v3.039h-3.04Zm0 5.468h3.04v3.04h-3.04Zm-5.468-5.468H8.05v3.039H5.01Zm0 5.468H8.05v3.04H5.01Zm0 0"/></svg>',
        arrow: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M.14 5.242 11.63 19.645c.187.238.59.238.781 0L23.898 5.242a.725.725 0 0 0 .106-.652c-.016-.047-.035-.082-.047-.11a.504.504 0 0 0-.441-.265H.523a.5.5 0 0 0-.441.265.695.695 0 0 0 .059.762Zm0 0"/></svg>',
    },
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
    customPeriods: [
        {
            label: 'Today',
            from: new Date(),
            to: new Date(),
            mode: 'day',
        },
        {
            label: 'YTD',
            from: new Date(2021, 0, 1),
            to: new Date(),
            mode: 'day',
        },
    ],
    singleSelect: false,
};
