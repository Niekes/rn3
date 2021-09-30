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
    getDateOfISOWeek,
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
        const periodSelection = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-period-selection' });
        const periodSelectionFrom = appendSelection(periodSelection, 'div', { class: 'rn3-datepicker__dropdown-period-selection-from' });
        const periodSelectionFromInput = appendSelection(periodSelectionFrom, 'input', { class: 'rn3-datepicker__dropdown-period-selection-from-input' });
        const periodSelectionFromIcon = appendSelection(periodSelectionFrom, 'div', { class: 'rn3-datepicker__dropdown-period-selection-from-icon' });
        const periodSelectionTo = appendSelection(periodSelection, 'div', { class: 'rn3-datepicker__dropdown-period-selection-to' });
        const periodSelectionToInput = appendSelection(periodSelectionTo, 'input', { class: 'rn3-datepicker__dropdown-period-selection-to-input' });
        const periodSelectionToIcon = appendSelection(periodSelectionTo, 'div', { class: 'rn3-datepicker__dropdown-period-selection-to-icon' });
        const periodControl = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-period-control' });
        const periodsWrapper = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-periods-wrapper' });
        const customPeriodsWrapper = appendSelection(dropdown, 'div', { class: 'rn3-datepicker__dropdown-custom-periods-wrapper' });

        this.#elements = {
            dropdown,
            form,
            icon,
            display,
            arrow,
            periodSelection,
            periodSelectionFrom,
            periodSelectionFromInput,
            periodSelectionFromIcon,
            periodSelectionTo,
            periodSelectionToInput,
            periodSelectionToIcon,
            periodControl,
            periodsWrapper,
            customPeriodsWrapper,
        };

        this.#elements.icon.html(this.settings.form.icon);
        this.#elements.arrow.html(this.settings.form.arrow);

        this.#elements.periodSelectionFromIcon.html(this.settings.dropdown.input.from.icon);
        this.#elements.periodSelectionFromInput.attr('placeholder', this.settings.dropdown.input.from.placeholder);

        this.#elements.periodSelectionToIcon.html(this.settings.dropdown.input.to.icon);
        this.#elements.periodSelectionToInput.attr('placeholder', this.settings.dropdown.input.to.placeholder);

        this.#today = timeDay();

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
                controlData: [
                    {
                        text: this.settings.dropdown.previousBtn,
                        value: -1,
                    },
                    {
                        text: null,
                        value: 'month',
                    },
                    {
                        text: this.settings.dropdown.nextBtn,
                        value: 1,
                    },
                ],
            },
            month: {
                marked: {
                    from: null,
                    to: null,
                },
                view: null,
                format: timeFormat('%b'),
                controlData: [
                    {
                        text: this.settings.dropdown.previousBtn,
                        value: -12,
                    },
                    {
                        text: this.settings.modes.day.label,
                        value: 'day',
                    },
                    {
                        text: this.settings.modes.week.label,
                        value: 'week',
                    },
                    {
                        text: this.settings.modes.month.label,
                        value: 'month',
                    },
                    {
                        text: this.settings.dropdown.nextBtn,
                        value: 12,
                    },
                ],
            },
            week: {
                marked: {
                    from: null,
                    to: null,
                },
                view: null,
                format: timeFormat('%V'),
                controlData: [
                    {
                        text: this.settings.dropdown.previousBtn,
                        value: -12,
                    },
                    {
                        text: this.settings.modes.day.label,
                        value: 'day',
                    },
                    {
                        text: this.settings.modes.week.label,
                        value: 'week',
                    },
                    {
                        text: this.settings.modes.month.label,
                        value: 'month',
                    },
                    {
                        text: this.settings.dropdown.nextBtn,
                        value: 12,
                    },
                ],
            },
        };

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

        this.#elements.periodsWrapper
            .on('mouseleave', () => {
                this.#setDateMarkTo(null);
                this.#updateDateSelection();
            });

        this.#elements.periodSelectionFrom.on('click', this.#focusFromPeriodInput);
        this.#elements.periodSelectionFromInput.on('focus', this.#focusFromPeriodInput);
        this.#elements.periodSelectionFromInput.on('keyup', (e) => {
            const d = e.target.value.trim();

            if (d.length <= 0) {
                return;
            }

            const from = this.settings.dropdown.input.from.timeParse(d);

            if (isValidDate(from)) {
                console.log(from); // TODO
            }
        });

        this.#elements.periodSelectionTo.on('click', this.#focusToPeriodInput);
        this.#elements.periodSelectionToInput.on('focus', this.#focusToPeriodInput);
        this.#elements.periodSelectionToInput.on('keyup', (e) => {
            const d = e.target.value.trim();

            if (d.length <= 0) {
                return;
            }

            const to = this.settings.dropdown.input.to.timeParse(d);

            if (isValidDate(to)) {
                console.log(to); // TODO
            }
        });

        this.on('outside-click', () => {
            const isOpen = this.#elements.dropdown
                .classed('rn3-datepicker__dropdown--open');

            if (!isOpen) {
                return;
            }

            this.#closeDropdown();

            const dates = this.data.values;

            this.#setView(dates.from);

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
            Reset highlighted dates in the dropdown
        */
        this.#setDateMarkFrom(null);
        this.#setDateMarkTo(null);

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
        this.#setDateMarkFrom(null);
        this.#setDateMarkTo(null);

        this.#periods.selected = null;
        this.#periods.day.marked.from = null;
        this.#periods.day.marked.to = null;

        this.#elements.periodSelectionFromInput.node().value = '';
        this.#elements.periodSelectionToInput.node().value = '';
        this.#elements.periodSelectionFrom.classed('rn3-datepicker__dropdown-period-selection-from--focus', false);
        this.#elements.periodSelectionTo.classed('rn3-datepicker__dropdown-period-selection-to--focus', false);
        this.#elements.periodControl.classed('rn3-datepicker__dropdown-period-control--visible', false);
        this.#elements.periodsWrapper.classed('rn3-datepicker__dropdown-periods-wrapper--visible', false);
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
        this.#closeDropdown();

        this.update({ values });

        const v = values.customPeriod ? values : this.#convertDates(values);

        this.dispatch('date-selected', {
            ...v,
            mode: this.settings.activeMode,
        });
    };

    #getDayData = (activePeriod) => {
        let dayData = null;

        const pageMonthFloored = timeMonth.floor(activePeriod.view);
        const daysInPageMonth = getDaysInMonth(pageMonthFloored);
        const firstOfPageMonth = getFirstOfMonth(pageMonthFloored).getDay();
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

        if (dayData.length <= 42) {
            dayData.push(...range(0, 43 - dayData.length).map(() => '&nbsp;'));
        }

        dayData = dayData
            .map(d => ({
                value: typeof d === 'number'
                    ? new Date(pageMonthFloored.getFullYear(), pageMonthFloored.getMonth(), d)
                    : d,
            }));

        dayData.label = timeFormat('%b \'%y')(pageMonthFloored);

        this.#periods.day.controlData[1].text = timeFormat('%B \'%y')(timeMonth.floor(activePeriod.view));

        return {
            control: this.#periods.day.controlData,
            values: dayData,
        };
    };

    #getMonthData = (activePeriod) => {
        const values = [];
        const { pages } = this.settings.modes.month;

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
            control: this.#periods.month.controlData,
            values,
        };
    };

    #getWeekData = (activePeriod) => {
        const values = [];
        const { pages } = this.settings.modes.week;

        for (let i = 0; i < pages; i += 1) {
            let weekData = null;

            const pageYearFloored = timeYear.floor(activePeriod.view);
            const pageYear = timeYear.offset(pageYearFloored, i - pages + Math.round(pages / 2));

            weekData = range(1, getISOWeeks(pageYear) + 1)
                .map(w => ({
                    value: timeMonday(getDateOfISOWeek(w, pageYear.getFullYear())),
                }));

            values[i] = weekData;
            values[i].label = timeFormat('%Y')(pageYear);
        }

        return {
            control: this.#periods.month.controlData,
            values,
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

    #markPeriod = (d, marked = { from: null, to: null }) => {
        const { from, to } = marked;

        switch (this.settings.activeMode) {
        case 'day': {
            return {
                isStart: from
                    ? d.getTime() === from.getTime()
                    : false,
                isMiddle: from && to
                    ? (d.getTime() >= from.getTime()
                    && d.getTime() <= to.getTime())
                    || (d.getTime() <= from.getTime()
                    && d.getTime() >= to.getTime())
                    : false,
                isEnd: to
                    ? d.getTime() === to.getTime()
                    : false,
                isNow: d.getTime() === this.#today.getTime(),
                isOutOfRange: d.getTime() < this.settings.modes.day.minDate.getTime()
                    || d.getTime() > this.settings.modes.day.maxDate.getTime(),
                highlighted: this.settings.modes.day.daysHighlighted.includes(d.getDay()),
                disabled: this.settings.modes.day.daysDisabled.includes(d.getDay()),
            };
        }
        case 'week': {
            const sameYearFrom = d.getFullYear() === from.getFullYear();
            const sameYearTo = d.getFullYear() === timeMonday(to).getFullYear();
            const sameWeekFrom = timeFormat('%V')(d) === timeFormat('%V')(from);
            const sameWeekTo = timeFormat('%V')(d) === timeFormat('%V')(timeMonday(to));

            return {
                isStart: timeFormat('%V')(d) === timeFormat('%V')(from)
                    && sameYearFrom
                    && sameWeekFrom,
                isMiddle: d.getTime() >= from.getTime()
                    && d.getTime() <= to.getTime(),
                isEnd: timeFormat('%V')(d) === timeFormat('%V')(to)
                    && sameYearTo
                    && sameWeekTo,
                isNow: timeFormat('%V')(d) === timeFormat('%V')(this.#today)
                    && d.getFullYear() === this.#today.getFullYear(),
                isOutOfRange: d.getTime() < this.settings.modes.week.minDate.getTime()
                    || d.getTime() > this.settings.modes.week.maxDate.getTime(),
                highlighted: this.settings.modes.week.weeksHighlighted.includes(+timeFormat('%V')(d)),
                disabled: this.settings.modes.week.weeksDisabled.includes(+timeFormat('%V')(d)),
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
                highlighted: this.settings.modes.month.monthsHighlighted.includes(d.getMonth()),
                disabled: this.settings.modes.month.monthsDisabled.includes(d.getMonth()),
            };
        }
        default:
            throw new Error(`Selected mode does not exist: ${this.settings.activeMode}`);
        }
    };

    #focusFromPeriodInput = () => {
        this.#elements.periodSelectionFrom.classed('rn3-datepicker__dropdown-period-selection-from--focus', true);
        this.#elements.periodSelectionTo.classed('rn3-datepicker__dropdown-period-selection-to--focus', false);

        this.#elements.periodControl.classed('rn3-datepicker__dropdown-period-control--visible', true);
        this.#elements.periodsWrapper.classed('rn3-datepicker__dropdown-periods-wrapper--visible', true);

        this.#elements.periodSelectionFromInput.node().focus();

        this.#periods.selected = 'from';

        this.#setDateMarkTo(null);
    };

    #focusToPeriodInput = () => {
        if (!isValidDate(this.#periods.day.marked.from)) {
            this.#focusFromPeriodInput();

            return;
        }

        this.#elements.periodSelectionFrom.classed('rn3-datepicker__dropdown-period-selection-from--focus', false);
        this.#elements.periodSelectionTo.classed('rn3-datepicker__dropdown-period-selection-to--focus', true);

        this.#elements.periodSelectionToInput.node().focus();

        this.#periods.selected = 'to';
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
            .html(d => d.text);

        controlItems
            .exit()
            .remove();

        /*
            Create/update period pages
        */
        const periodItems = this.#elements.periodsWrapper.selectAll('div.rn3-datepicker__dropdown-period-items').data(periodData.values);

        periodItems
            .enter()
            .append('div')
            .attr('class', 'rn3-datepicker__dropdown-period-items')
            .on('mouseenter', (e, d) => {
                if (this.settings.activeMode !== 'day' || this.#periods.selected === 'from') {
                    this.#setDateMarkTo(null);
                    this.#updateDateSelection();

                    return;
                }

                this.#setDateMarkTo(d.value);
                this.#updateDateSelection();
            })
            .on('click', (e, d) => {
                const { from } = this.#periods.day.marked;

                if (select(e.target).classed('rn3-datepicker__dropdown-period-items--out-of-range')) return;

                if (
                    this.#periods.selected === 'to'
                    && isValidDate(this.#periods.day.marked.from)
                ) {
                    this.#setDateMarkTo(d.value);

                    this.#updateDateSelection();

                    this.#elements.periodSelectionToInput
                        .node().value = this.settings.modes.day.render(d.value);

                    if (d.value.getTime() < from.getTime()) {
                        this.#applyDates({
                            from: d.value,
                            to: from,
                            customPeriod: false,
                        });
                    }

                    if (d.value.getTime() > from.getTime()) {
                        this.#applyDates({
                            from,
                            to: d.value,
                            customPeriod: false,
                        });
                    }
                }

                if (this.#periods.selected === 'from') {
                    this.#setDateMarkFrom(d.value);

                    this.#focusToPeriodInput();

                    this.#updateDateSelection();

                    this.#elements.periodSelectionFromInput
                        .node().value = this.settings.modes.day.render(d.value);
                }

                this.#updateDateSelection();
            })
            .merge(periodItems)
            .html((d, i, nodes) => {
                const node = select(nodes[i]);
                const isValid = isValidDate(d.value);

                /*
                    Reset all css classes
                */
                node.classed('rn3-datepicker__dropdown-period-items--valid-date', false);
                node.classed('rn3-datepicker__dropdown-period-items--not-valid-date', false);
                node.classed('rn3-datepicker__dropdown-period-items--start', false);
                node.classed('rn3-datepicker__dropdown-period-items--end', false);
                node.classed('rn3-datepicker__dropdown-period-items--middle', false);
                node.classed('rn3-datepicker__dropdown-period-items--now', false);

                node.classed('rn3-datepicker__dropdown-period-items--valid-date', isValid);
                node.classed('rn3-datepicker__dropdown-period-items--not-valid-date', !isValid);

                if (isValid) {
                    const period = this.#markPeriod(d.value, marked);

                    node.classed('rn3-datepicker__dropdown-period-items--start', period.isStart);
                    node.classed('rn3-datepicker__dropdown-period-items--end', period.isEnd);
                    node.classed('rn3-datepicker__dropdown-period-items--middle', period.isMiddle);
                    node.classed('rn3-datepicker__dropdown-period-items--now', period.isNow);
                    node.classed('rn3-datepicker__dropdown-period-items--out-of-range', period.isOutOfRange);
                    node.classed('rn3-datepicker__dropdown-period-items--highlighted', period.highlighted);
                    node.classed('rn3-datepicker__dropdown-period-items--disabled', period.disabled);

                    if (period.isMiddle && period.isStart) {
                        node.classed('rn3-datepicker__dropdown-period-items--middle', false);
                    }

                    if (period.isMiddle && period.isEnd) {
                        node.classed('rn3-datepicker__dropdown-period-items--middle', false);
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
