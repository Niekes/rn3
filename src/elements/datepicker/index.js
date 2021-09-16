import {
    select,
    timeFormat,
    timeMonday,
    timeDay,
    range,
    timeMonth,
} from 'd3';

import Element from '../Element';

import {
    appendSelection,
} from '../../utils/selection';

import {
    normalizeHours,
    getFirstOfMonth,
    getLastOfMonth,
    isValidDate,
    getDaysInMonth,
    getISOWeeks,
    getDateByWeek,
} from '../../utils/date';

import defaultSettings from './default-settings';

export default class Datepicker extends Element {
    #elements;

    #periods;

    #today;

    #counter;

    constructor(data) {
        super(data, defaultSettings);

        /*
            Add necessary elements
        */
        const dropdown = appendSelection(Element.container, 'div', { class: 'rn3-datepicker__dropdown' });
        const form = appendSelection(Element.container, 'div', { class: 'rn3-datepicker__form' });
        const icon = appendSelection(form, 'div', { class: 'rn3-datepicker__form-icon' });
        const display = appendSelection(form, 'div', { class: 'rn3-datepicker__form-display' });
        const arrow = appendSelection(form, 'div', { class: 'rn3-datepicker__form-arrow' });
        const periodControl = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-period-control' });
        const periodsWrapper = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-periods-wrapper' });
        const customPeriodsWrapper = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-custom-periods-wrapper' });

        this.#elements = {
            dropdown,
            form,
            icon,
            display,
            arrow,
            periodControl,
            periodsWrapper,
            customPeriodsWrapper,
        };

        this.#elements.icon.html(this.settings.form.icon);
        this.#elements.arrow.html(this.settings.form.arrow);

        /*
            Init periods
        */
        this.#periods = {
            selected: null,
            day: {
                marked: {
                    from: null,
                    to: null,
                },
                view: null,
                format: timeFormat('%e'),
            },
            month: {
                marked: {
                    from: null,
                    to: null,
                },
                view: null,
                format: timeFormat('%b'),
            },
            week: {
                marked: {
                    from: null,
                    to: null,
                },
                view: null,
                format: timeFormat('%V'),
            },
        };

        this.#today = new Date();

        this.#counter = 0;

        /*
            Add event listener
        */
        this.#elements.form.on('click', () => {
            const isOpen = this.#elements.dropdown
                .classed('rn3-datepicker__dropdown--open');

            if (isOpen) {
                this.#closeDropdown();
            }

            if (!isOpen) {
                this.#openDropdown();
            }
        });

        this.on('outside-click', () => {
            this.#closeDropdown();
        });
    }

    update(updatedData) {
        this.data = {
            ...this.data,
            ...updatedData,
        };

        this.settings = Element.mergeSettings(this.settings, this.data.settings);

        /*
            Normalize hours
        */
        normalizeHours(this.data.values.from);
        normalizeHours(this.data.values.to);
        normalizeHours(this.settings.minDate);
        normalizeHours(this.settings.maxDate);
        normalizeHours(this.#today);

        this.settings.customPeriods.forEach((c) => {
            normalizeHours(c.from);
            normalizeHours(c.to);
        });

        /*
            Set css classes
        */
        select(`#${this.id}`).classed('rn3-datepicker--day-mode', this.settings.activeMode === 'day');
        select(`#${this.id}`).classed('rn3-datepicker--week-mode', this.settings.activeMode === 'week');
        select(`#${this.id}`).classed('rn3-datepicker--month-mode', this.settings.activeMode === 'month');

        /*
            Convert dates
        */
        const convertedDates = this.#convertDates(this.data.values);

        const from = this.#renderDate(convertedDates.from);
        const to = this.#renderDate(convertedDates.to);

        /*
            Update date display
        */
        if (from === to) {
            this.#elements.display.text(from);
        }

        if (from !== to) {
            this.#elements.display.text(`${from} - ${to}`);
        }

        /*
            Set view of date selection
        */
        this.#setView(convertedDates.from);

        /*
            Set the dates that should be marked and highlighted in the dropdown
        */
        this.#setDateMarkFrom(convertedDates.from);
        this.#setDateMarkTo(convertedDates.to);

        /*
            Update date selection in dropdown
        */
        this.#updateDateSelection();
    }

    #renderDate = date => this.settings.modes[this.settings.activeMode].render(date)

    #openDropdown = () => {
        this.#toggleDropdown(true);
    }

    #closeDropdown = () => {
        this.#toggleDropdown(false);
    }

    #toggleDropdown = (open) => {
        this.#elements.dropdown
            .classed('rn3-datepicker__dropdown--open', open);
    }

    #setView = (v) => {
        this.#periods[this.settings.activeMode].view = v;
    };

    #setDateMarkFrom = (f) => {
        this.#periods[this.settings.activeMode].marked.from = f;
    };

    #setDateMarkTo = (t) => {
        this.#periods[this.settings.activeMode].marked.to = t;
    };

    #convertDates = (dates) => {
        switch (this.settings.activeMode) {
        case 'month': {
            return {
                from: getFirstOfMonth(dates.from),
                to: getLastOfMonth(dates.to),
            };
        }
        case 'week': {
            return {
                from: timeMonday(dates.from),
                to: timeDay.offset(timeMonday(dates.to), 6),
            };
        }
        default: // day
            return Object.assign({}, dates);
        }
    };

    #getActiveMode = () => this.#periods[this.settings.activeMode];

    #getDayData = (activeMode) => {
        let dayData = null;

        const dayControlData = [
            {
                text: '&lsaquo;',
                value: -1,
            },
            {
                text: timeFormat('%b \'%y')(activeMode.view),
                value: null,
            },
            {
                text: '&rsaquo;',
                value: 1,
            },
        ];

        const daysInMonth = getDaysInMonth(activeMode.view);
        const firstOfMonth = getFirstOfMonth(activeMode.view).getDay();
        const daysOffset = firstOfMonth === 0 ? 6 : firstOfMonth - 1;

        dayData = range(1, daysInMonth + 1);

        for (let j = 0; j < daysOffset; j += 1) {
            dayData.unshift('&nbsp;');
        }

        const mon = timeMonday(this.#today);
        const tue = timeDay.offset(mon, 1);
        const wed = timeDay.offset(mon, 2);
        const thu = timeDay.offset(mon, 3);
        const fri = timeDay.offset(mon, 4);
        const sat = timeDay.offset(mon, 5);
        const sun = timeDay.offset(mon, 6);

        dayData.unshift(
            timeFormat('%a')(mon),
            timeFormat('%a')(tue),
            timeFormat('%a')(wed),
            timeFormat('%a')(thu),
            timeFormat('%a')(fri),
            timeFormat('%a')(sat),
            timeFormat('%a')(sun),
        );

        console.log(dayData, activeMode, this.settings.pages);

        return {
            control: dayControlData,
            values: dayData
                .map(d => ({
                    value: typeof d === 'number' ? new Date(activeMode.view.getFullYear(), activeMode.view.getMonth(), d) : d,
                })),
        };
    };

    #getMonthData = (activeMode) => {
        let monthData = null;

        const monthControlData = [
            {
                text: '&lsaquo;',
                value: -12,
            },
            {
                text: timeFormat('%Y')(activeMode.view),
                value: null,
            },
            {
                text: '&rsaquo;',
                value: 12,
            },
        ];

        monthData = range(0, 12)
            .map(m => ({
                value: new Date(activeMode.view.getFullYear(), m, 1),
            }));

        return {
            control: monthControlData,
            values: monthData,
        };
    };

    #getWeekData = (activeMode) => {
        let weekData = null;

        const weekControlData = [
            {
                text: '&lsaquo;',
                value: -12,
            },
            {
                text: timeFormat('%Y')(activeMode.view),
                value: null,
            },
            {
                text: '&rsaquo;',
                value: 12,
            },
        ];

        weekData = range(0, getISOWeeks(activeMode.view))
            .map(m => ({
                value: timeMonday(getDateByWeek(activeMode.view.getFullYear(), m + 1)),
            }));

        return {
            control: weekControlData,
            values: weekData,
        };
    };

    #getData = () => {
        const am = this.#getActiveMode();

        switch (this.settings.activeMode) {
        case 'month': {
            return this.#getMonthData(am);
        }
        case 'week': {
            return this.#getWeekData(am);
        }
        default: // day
            return this.#getDayData(am);
        }
    };

    #checkPeriod = (d, marked) => {
        switch (this.settings.activeMode) {
        case 'day': {
            return {
                isStart: d.getTime() === marked.from.getTime(),
                isMiddle: d.getTime()
                    >= marked.from.getTime()
                    && d.getTime()
                    <= marked.to.getTime(),
                isEnd: d.getTime() === marked.to.getTime(),
                isNow: d.getTime() === this.#today.getTime(),
                isOutOfRange: d.getTime() < this.settings.minDate.getTime()
                    || d.getTime() > this.settings.maxDate.getTime(),
            };
        }
        case 'month': {
            const sameYear = d.getFullYear() === marked.from.getFullYear();
            return {
                isStart: d.getMonth() === marked.from.getMonth() && sameYear,
                isMiddle: d.getMonth() > marked.from.getMonth()
                    && d.getMonth() < marked.to.getMonth() && sameYear,
                isEnd: d.getMonth() === marked.to.getMonth() && sameYear,
                isNow: d.getMonth() === this.#today.getMonth()
                    && d.getFullYear() === this.#today.getFullYear(),
            };
        }
        case 'week': {
            const sameYear = d.getFullYear() === marked.from.getFullYear();
            const sameWeek = timeFormat('%V')(d) === timeFormat('%V')(marked.from) && timeFormat('%V')(d) === timeFormat('%V')(marked.to);

            if (timeFormat('%V')(d) === timeFormat('%V')(marked.to)) {
                // TODO
                // eslint-disable-next-line
                console.log(timeFormat('%V')(d), timeFormat('%V')(marked.from), d);
            }

            return {
                isStart: timeFormat('%V')(d) === timeFormat('%V')(marked.from) && sameYear && sameWeek,
                isMiddle: timeFormat('%V')(d) > timeFormat('%V')(marked.from)
                    && timeFormat('%V')(d) < timeFormat('%V')(marked.to)
                    && sameYear && sameWeek,
                isEnd: timeFormat('%V')(d) === timeFormat('%V')(marked.to) && sameYear && sameWeek,
                isNow: timeFormat('%V')(d) === timeFormat('%V')(this.#today),
            };
        }
        default:
            throw new Error(`Selected mode does not exist: ${this.settings.activeMode}`);
        }
    };

    #updateDateSelection = () => {
        /*
            Get acive mode
        */
        const activeMode = this.#getActiveMode();

        /*
            Get the dates that will be marked and highlighted in the dropdown
        */
        const { marked } = activeMode;

        /*
            Get period data
        */
        const periodData = this.#getData();

        /*
            Create/update period control
        */
        const controlItems = this.#elements.periodControl
            .selectAll('div.period-control-items')
            .data(periodData.control);

        controlItems
            .enter()
            .append('div')
            .attr('class', 'period-control-items')
            .on('click', (e, d) => {
                e.stopPropagation();

                if (!d.value) return;

                const selPeriod = this.#getActiveMode().view;

                const m = getFirstOfMonth(selPeriod);

                this.#setView(timeMonth.offset(m, d.value));

                this.#updateDateSelection();
            })
            .merge(controlItems)
            .classed('period-control-items--disabled', d => !d.value)
            .html(d => d.text);

        controlItems
            .exit()
            .remove();

        /*
            Create/update period items
        */
        const periodItems = this.#elements.periodsWrapper.selectAll('div.period-items').data(periodData.values);

        periodItems
            .enter()
            .append('div')
            .attr('class', 'period-items')
            .on('click', (e, d) => {
                if (select(e.target).classed('period-items--out-of-range')) return;

                const isFrom = this.settings.singleSelect ? true : this.#counter % 2 === 0;

                if (isFrom) {
                    this.#setDateMarkFrom(d.value);
                }

                this.#setDateMarkTo(d.value);

                const { from } = marked;
                const { to } = marked;

                if (from.getTime() > to.getTime()) {
                    this.#setDateMarkFrom(to);
                    this.#setDateMarkTo(from);
                }

                this.#counter += 1;

                this.#updateDateSelection();
            })
            .merge(periodItems)
            .html((d, i, nodes) => {
                const node = select(nodes[i]);
                const isValid = isValidDate(d.value);

                /*
                    Reset all css classes
                */
                node.classed('period-items--valid-date', false);
                node.classed('period-items--not-valid-date', false);
                node.classed('period-items--start', false);
                node.classed('period-items--end', false);
                node.classed('period-items--middle', false);
                node.classed('period-items--now', false);

                node.classed('period-items--valid-date', isValid);
                node.classed('period-items--not-valid-date', !isValid);


                if (isValid) {
                    const period = this.#checkPeriod(d.value, marked);

                    node.classed('period-items--start', period.isStart);
                    node.classed('period-items--end', period.isEnd);
                    node.classed('period-items--middle', period.isMiddle);
                    node.classed('period-items--now', period.isNow);
                    node.classed('period-items--out-of-range', period.isOutOfRange);

                    if (period.isMiddle && period.isStart) {
                        node.classed('period-items--middle', false);
                    }

                    if (period.isMiddle && period.isEnd) {
                        node.classed('period-items--middle', false);
                    }

                    return this.#periods[this.settings.activeMode].format(d.value).trim();
                }
                return d.value;
            });

        periodItems
            .exit()
            .remove();
    };
}
