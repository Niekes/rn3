import {
    timeFormat,
    timeParse,
} from 'd3';

import defaults from '../../utils/default-settings';

export default {
    ...defaults,
    css: 'rn3-datepicker--default',
    activeMode: 'day',
    form: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M16.91 3.191V.758h-1.82V3.19H8.91V.758H7.09V3.19H0v3.95h24V3.19ZM0 23.242h24V8.961H0Zm15.95-11.394h3.038v3.039H15.95Zm0 5.468h3.038v3.04H15.95Zm-5.47-5.468h3.04v3.039h-3.04Zm0 5.468h3.04v3.04h-3.04Zm-5.468-5.468H8.05v3.039H5.01Zm0 5.468H8.05v3.04H5.01Zm0 0"/></svg>',
        arrow: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M.14 5.242 11.63 19.645c.187.238.59.238.781 0L23.898 5.242a.725.725 0 0 0 .106-.652c-.016-.047-.035-.082-.047-.11a.504.504 0 0 0-.441-.265H.523a.5.5 0 0 0-.441.265.695.695 0 0 0 .059.762Zm0 0"/></svg>',
    },
    dropdown: {
        previousBtn: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 5.969V18.03c0 .836-1.012 1.254-1.602.664l-6.03-6.03a.945.945 0 0 1 0-1.33l6.03-6.03c.59-.59 1.602-.172 1.602.664Zm0 0"/></svg>',
        nextBtn: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9 17.898c0 1.075 1.266 1.649 2.074.942l6.309-5.524a1.749 1.749 0 0 0 0-2.632L11.074 5.16C10.266 4.453 9 5.027 9 6.102Zm0 0"/></svg>',
        input: {
            from: {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M0 23.242h24V8.961H0Zm15.36-11.644.535-.551a.568.568 0 0 1 .816 0l4.687 4.805a.604.604 0 0 1 0 .84L16.711 21.5a.568.568 0 0 1-.816 0l-.536-.55a.606.606 0 0 1 .008-.848l2.906-2.84h-6.925a.585.585 0 0 1-.578-.594v-.79c0-.331.257-.593.578-.593h6.925l-2.906-2.84a.602.602 0 0 1-.008-.847Zm1.55-8.407V.758h-1.82V3.19H8.91V.758H7.09V3.19H0v3.95h24V3.19Zm0 0"/></svg>',
                placeholder: 'mm/dd/yyyy',
                timeParse: d => timeParse('%x')(d),
            },
            to: {
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M24 23.242H0V8.961h24ZM8.64 11.598l-.535-.551a.568.568 0 0 0-.816 0l-4.687 4.805a.604.604 0 0 0 0 .84L7.289 21.5c.227.23.594.23.816 0l.536-.55a.606.606 0 0 0-.008-.848l-2.906-2.84h6.925c.32 0 .578-.266.578-.594v-.79a.583.583 0 0 0-.578-.593H5.727l2.906-2.84a.602.602 0 0 0 .008-.847ZM7.09 3.19V.758h1.82V3.19h6.18V.758h1.82V3.19H24v3.95H0V3.19Zm0 0"/></svg>',
                placeholder: 'mm/dd/yyyy',
                timeParse: d => timeParse('%x')(d),
            },
        },
    },
    modes: {
        day: {
            label: 'Day',
            minDate: new Date(new Date().getFullYear(), 0, 1),
            maxDate: new Date(new Date().getFullYear(), 11, 31),
            show: false,
            render: d => timeFormat('%x')(d),
            weekStart: 0,
            customPeriods: [
                {
                    label: 'Today',
                    from: new Date(),
                    to: new Date(),
                },
                {
                    label: 'YTD',
                    from: new Date(new Date().getFullYear(), 0, 1),
                    to: new Date(),
                },
            ],
            daysHighlighted: [],
            daysDisabled: [],
        },
        month: {
            label: 'Month',
            show: false,
            minDate: new Date(new Date().getFullYear(), 0, 1),
            maxDate: new Date(new Date().getFullYear(), 11, 31),
            render: d => timeFormat('%x')(d),
            customPeriods: [
                {
                    label: 'Today',
                    from: new Date(),
                    to: new Date(),
                },
                {
                    label: 'MTD',
                    from: new Date(new Date().getFullYear(), 0, 1),
                    to: new Date(),
                },
            ],
            monthsHighlighted: [],
            monthsDisabled: [],
        },
        week: {
            label: 'Week',
            show: false,
            minDate: new Date(new Date().getFullYear(), 0, 1),
            maxDate: new Date(new Date().getFullYear(), 11, 31),
            render: d => timeFormat('%x')(d),
            customPeriods: [],
            weeksHighlighted: [],
            weeksDisabled: [],
        },
    },
    singleSelect: false,
};
