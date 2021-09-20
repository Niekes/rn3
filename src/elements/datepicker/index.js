import {
    select,
    timeFormat,
    timeMonday,
    timeYear,
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
        const periodDisplay = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-period-display' });
        const periodPagesWrapper = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-periods-wrapper' });
        const customPeriodsWrapper = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-custom-periods-wrapper' });
        const actionWrapper = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-action-wrapper' });

        this.#elements = {
            dropdown,
            form,
            icon,
            display,
            arrow,
            periodControl,
            periodDisplay,
            periodPagesWrapper,
            customPeriodsWrapper,
            actionWrapper,
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

        /*
            Add apply button
        */
        this.#elements.actionWrapper
            .append('button')
            .attr('class', 'rn3-datepicker__dropdown-apply-button')
            .text('Apply')
            .on('click', () => {
                this.#applyDates({
                    ...this.#getActivePeriod().marked,
                    customPeriod: false,
                });
            });

        this.on('outside-click', () => {
            const isOpen = this.#elements.dropdown
                .classed('rn3-datepicker__dropdown--open');

            if (!isOpen) {
                return;
            }

            this.settings.activeMode = this.#periods.selected || this.settings.activeMode;

            this.#counter = 0;

            this.#closeDropdown();

            const dates = this.data.values;

            this.#setView(dates.from);
            this.#setDateMarkFrom(dates.from);
            this.#setDateMarkTo(dates.to);

            this.#updateDateSelection();
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
        normalizeHours(this.settings.modes.day.minDate);
        normalizeHours(this.settings.modes.day.maxDate);
        normalizeHours(this.settings.modes.month.minDate);
        normalizeHours(this.settings.modes.month.maxDate);
        normalizeHours(this.settings.modes.week.minDate);
        normalizeHours(this.settings.modes.week.maxDate);
        normalizeHours(this.#today);

        Object.keys(this.settings.modes).forEach((mode) => {
            this.settings.modes[mode].customPeriods.forEach((m) => {
                normalizeHours(m.from);
                normalizeHours(m.to);
            });
        });

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

    #getActivePeriod = () => this.#periods[this.settings.activeMode];

    #setActiveMode = (m) => {
        this.settings.activeMode = m;
    };

    #getActiveMode = () => this.settings.modes[this.settings.activeMode];

    #applyDates = (values) => {
        this.#toggleDropdown(false);

        this.#counter = 0;

        this.update({ values });

        const v = values.customPeriod ? values : this.#convertDates(values);

        this.dispatch('date-selected', {
            ...v,
            mode: this.settings.activeMode,
        });
    };

    #getDayData = (activePeriod) => {
        const values = [];
        const { pages } = this.settings.modes.day;
        const dayControlData = [
            {
                text: '&lsaquo;',
                value: -1,
            },
            {
                text: this.settings.modes.month.label,
                value: 'month',
            },
            {
                text: '&rsaquo;',
                value: 1,
            },
        ];

        for (let i = 0; i < pages; i += 1) {
            let dayData = null;

            const pageMonthFloored = timeMonth.floor(activePeriod.view);
            const pageMonth = timeMonth.offset(pageMonthFloored, i - pages + Math.round(pages / 2));

            const daysInPageMonth = getDaysInMonth(pageMonth);
            const firstOfPageMonth = getFirstOfMonth(pageMonth).getDay();
            const daysOffset = firstOfPageMonth === 0 ? 6 : firstOfPageMonth - 1;

            dayData = range(1, daysInPageMonth + 1);

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

            values[i] = dayData
                .map(d => ({
                    value: typeof d === 'number'
                        ? new Date(pageMonth.getFullYear(), pageMonth.getMonth(), d)
                        : d,
                }));

            values[i].label = timeFormat('%b \'%y')(pageMonth);
        }


        return {
            control: dayControlData,
            values,
        };
    };

    #getMonthData = (activePeriod) => {
        const values = [];
        const { pages } = this.settings.modes.month;
        const monthControlData = [
            {
                text: '&lsaquo;',
                value: -12,
            },
            {
                text: this.settings.modes.day.label,
                value: 'day',
            },
            {
                text: '&rsaquo;',
                value: 12,
            },
        ];

        for (let i = 0; i < pages; i += 1) {
            let monthData = null;

            const pageYearFloored = timeYear.floor(activePeriod.view);
            const pageYear = timeYear.offset(pageYearFloored, i - pages + Math.round(pages / 2));

            monthData = range(0, 12)
                .map(m => ({
                    value: new Date(pageYear.getFullYear(), m, 1),
                }));

            values[i] = monthData;
            values[i].label = timeFormat('%Y')(pageYear);
        }

        return {
            control: monthControlData,
            values,
        };
    };

    #getWeekData = (activePeriod) => {
        let weekData = null;

        const weekControlData = [
            {
                text: '&lsaquo;',
                value: -12,
            },
            {
                text: timeFormat('%Y')(activePeriod.view),
                value: null,
            },
            {
                text: '&rsaquo;',
                value: 12,
            },
        ];

        weekData = range(0, getISOWeeks(activePeriod.view))
            .map(m => ({
                value: timeMonday(getDateByWeek(activePeriod.view.getFullYear(), m + 1)),
            }));

        return {
            control: weekControlData,
            values: weekData,
        };
    };

    #getData = () => {
        const ap = this.#getActivePeriod();

        switch (this.settings.activeMode) {
        case 'month': {
            return this.#getMonthData(ap);
        }
        case 'week': {
            return this.#getWeekData(ap);
        }
        default: // day
            return this.#getDayData(ap);
        }
    };

    #checkPeriod = (d, marked) => {
        const { from, to } = marked;
        switch (this.settings.activeMode) {
        case 'day': {
            return {
                isStart: from ? d.getTime() === from.getTime() : false,
                isMiddle: d.getTime() >= from.getTime()
                    && d.getTime() <= to.getTime(),
                isEnd: d.getTime() === to.getTime(),
                isNow: d.getTime() === this.#today.getTime(),
                isOutOfRange: d.getTime() < this.settings.modes.day.minDate.getTime()
                    || d.getTime() > this.settings.modes.day.maxDate.getTime(),
            };
        }
        case 'month': {
            const sameYear = d.getFullYear() === from.getFullYear();
            return {
                isStart: d.getMonth() === from.getMonth() && sameYear,
                isMiddle: d.getMonth() > from.getMonth()
                    && d.getMonth() < to.getMonth() && sameYear,
                isEnd: d.getMonth() === to.getMonth() && sameYear,
                isNow: d.getMonth() === this.#today.getMonth()
                    && d.getFullYear() === this.#today.getFullYear(),
                isOutOfRange: d.getTime() < this.settings.modes.month.minDate.getTime()
                    || d.getTime() > this.settings.modes.month.maxDate.getTime(),
            };
        }
        case 'week': {
            const sameYear = d.getFullYear() === from.getFullYear();
            const sameWeek = timeFormat('%V')(d) === timeFormat('%V')(from) && timeFormat('%V')(d) === timeFormat('%V')(to);

            if (timeFormat('%V')(d) === timeFormat('%V')(to)) {
                // TODO
                // eslint-disable-next-line
                console.log(timeFormat('%V')(d), timeFormat('%V')(from), d);
            }

            return {
                isStart: timeFormat('%V')(d) === timeFormat('%V')(from) && sameYear && sameWeek,
                isMiddle: timeFormat('%V')(d) > timeFormat('%V')(from)
                    && timeFormat('%V')(d) < timeFormat('%V')(to)
                    && sameYear && sameWeek,
                isEnd: timeFormat('%V')(d) === timeFormat('%V')(to) && sameYear && sameWeek,
                isNow: timeFormat('%V')(d) === timeFormat('%V')(this.#today),
            };
        }
        default:
            throw new Error(`Selected mode does not exist: ${this.settings.activeMode}`);
        }
    };

    #updateDateSelection = () => {
        /*
            Get acive period
        */
        const activePeriod = this.#getActivePeriod();
        /*
            Get acive mode
        */
        const activeMode = this.#getActiveMode();

        /*
            Set css classes
        */
        select(`#${this.id}`).classed('rn3-datepicker--day-mode', this.settings.activeMode === 'day');
        select(`#${this.id}`).classed('rn3-datepicker--week-mode', this.settings.activeMode === 'week');
        select(`#${this.id}`).classed('rn3-datepicker--month-mode', this.settings.activeMode === 'month');

        /*
            Get the dates that will be marked and highlighted in the dropdown
        */
        const { marked } = activePeriod;

        /*
            Get period data
        */
        const periodData = this.#getData();

        /*
            Create/update period control
        */
        const controlItems = this.#elements.periodControl
            .selectAll('div.rn3-datepicker__dropdown-period-control-buttons')
            .data(periodData.control);

        controlItems
            .enter()
            .append('div')
            .attr('class', 'rn3-datepicker__dropdown-period-control-buttons')
            .on('click', (e, d) => {
                e.stopPropagation();

                if (!d.value) return;

                if (Object.keys(this.settings.modes).includes(d.value)) {
                    const ap = this.#getActivePeriod();

                    this.#periods.selected = this.settings.activeMode;
                    this.#periods[d.value].marked.from = ap.marked.from;
                    this.#periods[d.value].marked.to = ap.marked.to;

                    this.#setActiveMode(d.value);
                    this.#setView(this.#periods[d.value].marked.from);
                    this.#updateDateSelection();

                    return;
                }

                const selPeriod = this.#getActivePeriod().view;
                const m = getFirstOfMonth(selPeriod);

                this.#setView(timeMonth.offset(m, d.value));
                this.#updateDateSelection();
            })
            .merge(controlItems)
            .classed('rn3-datepicker__dropdown-period-control-buttons--disabled', d => !d.value)
            .html(d => d.text);

        controlItems
            .exit()
            .remove();

        /*
            Period display
        */
        const displays = this.#elements.periodDisplay
            .selectAll('div.rn3-datepicker__dropdown-period-displays')
            .data(periodData.values);

        displays
            .enter()
            .append('div')
            .attr('class', 'rn3-datepicker__dropdown-period-displays')
            .merge(displays)
            .html(d => d.label);

        displays
            .exit()
            .remove();

        /*
            Period pages
        */
        const pages = this.#elements.periodPagesWrapper
            .selectAll('div.rn3-datepicker__dropdown-period-pages')
            .data(periodData.values);

        const pagesEnter = pages
            .enter()
            .append('div')
            .attr('class', 'rn3-datepicker__dropdown-period-pages')
            .merge(pages);

        pages
            .exit()
            .remove();

        /*
            Create/update period pages
        */
        const periodItems = pagesEnter.selectAll('div.period-items').data(d => d);

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

                    return activePeriod.format(d.value).trim();
                }

                return d.value;
            });

        periodItems
            .exit()
            .remove();

        /*
            Custom periods
        */
        const customPeriods = this.#elements.customPeriodsWrapper
            .selectAll('button.rn3-datepicker__dropdown-custom-periods')
            .data(
                activeMode.customPeriods,
                d => d.label,
            );

        customPeriods
            .enter()
            .append('button')
            .attr('class', 'rn3-datepicker__dropdown-custom-periods')
            .on('click', (e, d) => {
                this.#applyDates({
                    ...d,
                    from: d.from,
                    to: d.to,
                    customPeriod: true,
                });
            })
            .merge(customPeriods)
            .text(d => d.label);

        customPeriods
            .exit()
            .remove();

        this.#elements.customPeriodsWrapper
            .classed(
                'rn3-datepicker__dropdown-custom-periods-wrapper--empty',
                activeMode.customPeriods.length === 0,
            );
    };
}
