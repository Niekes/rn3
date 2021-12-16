import {
    select,
    timeFormat,
    timeMonday,
    timeYear,
    timeDay,
    range,
    timeMonth,
} from 'd3';

import Element from '../Element.js';

import {
    appendSelection,
} from '../../utils/selection.js';

import {
    normalizeHours,
    getFirstOfMonth,
    getLastOfMonth,
    isValidDate,
    getDaysInMonth,
} from '../../utils/date.js';

import defaultSettings from './default-settings.js';

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
            activeMode: 'day',
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
                        text: null,
                        value: 'year',
                    },
                    {
                        text: this.settings.dropdown.nextBtn,
                        value: 12,
                    },
                ],
            },
            year: {
                marked: {
                    from: null,
                    to: null,
                },
                view: null,
                format: timeFormat('%Y'),
                controlData: [
                    {
                        text: this.settings.dropdown.previousBtn,
                        value: -120,
                    },
                    {
                        text: null,
                        value: null,
                    },
                    {
                        text: this.settings.dropdown.nextBtn,
                        value: 120,
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

            this.#setView(this.#today);

            this.#updateDateSelection();
        });

        /*
            Set view of date selection
        */
        this.#setView(this.#today);

        /*
            Reset highlighted dates in the dropdown
        */
        this.#setDateMarkFrom(null);
        this.#setDateMarkTo(null);

        this.#updateDateSelection();
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
        normalizeHours(this.#today);

        this.settings.customPeriods.forEach((m) => {
            normalizeHours(m.from);
            normalizeHours(m.to);
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
        this.#setView(this.#today);

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

    #renderDate = (date) => this.settings.modes[this.settings.activeMode].render(date);

    #openDropdown = () => {
        this.#toggleDropdown(true);
    };

    #closeDropdown = () => {
        this.#toggleDropdown(false);
        this.#setDateMarkFrom(null);
        this.#setDateMarkTo(null);

        this.#periods.day.marked.from = null;
        this.#periods.day.marked.to = null;

        this.#elements.periodSelectionFromInput.node().value = '';
        this.#elements.periodSelectionToInput.node().value = '';
        this.#elements.periodSelectionFrom.classed('rn3-datepicker__dropdown-period-selection-from--focus', false);
        this.#elements.periodSelectionTo.classed('rn3-datepicker__dropdown-period-selection-to--focus', false);
        this.#elements.periodControl.classed('rn3-datepicker__dropdown-period-control--visible', false);
        this.#elements.periodsWrapper.classed('rn3-datepicker__dropdown-periods-wrapper--visible', false);
    };

    #toggleDropdown = (open) => {
        this.#elements.dropdown
            .classed('rn3-datepicker__dropdown--open', open);
    };

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
        case 'year': {
            return {
                from: timeMonday(dates.from),
                to: timeDay.offset(timeMonday(dates.to), 6),
            };
        }
        default: // day
            return { ...dates };
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
            .map((d) => ({
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
        let monthData = null;

        const pageYearFloored = timeYear.floor(activePeriod.view);

        monthData = range(0, 12)
            .map((m) => ({
                value: new Date(pageYearFloored.getFullYear(), m, 1),
            }));

        monthData.label = timeFormat('%Y')(pageYearFloored);

        this.#periods.month.controlData[1].text = timeFormat('%Y')(timeMonth.floor(activePeriod.view));

        return {
            control: this.#periods.month.controlData,
            values: monthData,
        };
    };

    #getYearData = (activePeriod) => {
        let yearData = null;

        const pageYearFloored = timeYear.floor(activePeriod.view);
        const rest = pageYearFloored.getFullYear() % 10;
        const decadeStart = pageYearFloored.getFullYear() - rest;
        const decadeEnd = decadeStart + 10;

        yearData = range(decadeStart, decadeEnd)
            .map((y) => ({
                value: new Date(y, 0, 1),
            }));

        yearData.label = timeFormat('%Y')(pageYearFloored);

        this.#periods.year.controlData[1].text = `${decadeStart} - ${decadeEnd}`;

        return {
            control: this.#periods.year.controlData,
            values: yearData,
        };
    };

    #getData = () => {
        const ap = this.#getActivePeriod();

        switch (this.settings.activeMode) {
        case 'month': {
            return this.#getMonthData(ap);
        }
        case 'year': {
            return this.#getYearData(ap);
        }
        default:
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
        case 'month': {
            return {
                isStart: false,
                isMiddle: false,
                isEnd: false,
                isNow: false,
                isOutOfRange: false,
                highlighted: false,
                disabled: false,
            };
        }
        case 'year': {
            return {
                isStart: false,
                isMiddle: false,
                isEnd: false,
                isNow: false,
                isOutOfRange: false,
                highlighted: false,
                disabled: false,
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
    };

    #isChoosingFrom = () => this.#elements.periodSelectionFrom
        .classed('rn3-datepicker__dropdown-period-selection-from--focus');

    #isChoosingTo = () => this.#elements.periodSelectionTo
        .classed('rn3-datepicker__dropdown-period-selection-to--focus');

    #updateDateSelection = () => {
        /*
            Get acive period
        */
        const activePeriod = this.#getActivePeriod();

        /*
            Set css classes
        */
        select(`#${this.id}`).classed('rn3-datepicker--day-mode', this.settings.activeMode === 'day');
        select(`#${this.id}`).classed('rn3-datepicker--month-mode', this.settings.activeMode === 'month');
        select(`#${this.id}`).classed('rn3-datepicker--year-mode', this.settings.activeMode === 'year');

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
            .selectAll('button.rn3-datepicker__dropdown-period-control-buttons')
            .data(periodData.control);

        controlItems
            .enter()
            .append('button')
            .attr('class', 'rn3-datepicker__dropdown-period-control-buttons')
            .on('click', (e, d) => {
                e.stopPropagation();

                if (!d.value) return;

                if (Object.keys(this.#periods).includes(d.value)) {
                    const { view } = this.#getActivePeriod();

                    this.#setActiveMode(d.value);

                    this.#setView(view);

                    this.#updateDateSelection();

                    return;
                }

                const selPeriod = this.#getActivePeriod().view;
                const m = getFirstOfMonth(selPeriod);

                this.#setView(timeMonth.offset(m, d.value));
                this.#updateDateSelection();
            })
            .merge(controlItems)
            .property('disabled', (d) => !d.value)
            .html((d) => d.text);

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
                if (this.settings.activeMode !== 'day' || this.#isChoosingFrom()) {
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

                if (this.settings.activeMode === 'month') {
                    if (this.#isChoosingFrom()) {
                        this.#focusFromPeriodInput();
                    }

                    this.#setActiveMode('day');
                    this.#setView(d.value);

                    this.#updateDateSelection();

                    return;
                }

                if (this.settings.activeMode === 'year') {
                    if (this.#isChoosingFrom()) {
                        this.#focusFromPeriodInput();
                    }

                    this.#setActiveMode('month');
                    this.#setView(d.value);

                    this.#updateDateSelection();

                    return;
                }

                if (this.#isChoosingTo()) {
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

                    if (d.value.getTime() > from.getTime()
                        || d.value.getTime() === from.getTime()) {
                        this.#applyDates({
                            from,
                            to: d.value,
                            customPeriod: false,
                        });
                    }
                }

                if (this.#isChoosingFrom()) {
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
                this.settings.customPeriods,
                (d) => d.label,
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
            .text((d) => d.label);

        customPeriods
            .exit()
            .remove();

        this.#elements.customPeriodsWrapper
            .classed(
                'rn3-datepicker__dropdown-custom-periods-wrapper--empty',
                this.settings.customPeriods.length === 0,
            );
    };
}
