import {
    select,
} from 'd3';

import Element from '../Element';

import {
    appendSelection,
    getChildrenFromSelection,
} from '../../utils/selection';

import {
    debounce,
} from '../../utils/function';

import {
    isArrayOfObjects,
} from '../../utils/array';

import {
    isKey,
    isNavigatingVertically,
    isNavigatingHorizontally,
} from '../../utils/keyboard';

import defaultSettings from './default-settings';

export default class Searchbar extends Element {
    #keyCounter;

    #elements;

    #speechRecognition;

    constructor(data) {
        super(data, defaultSettings);

        this.#keyCounter = 0;

        /*
            SpeechRecognition
        */
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            this.#speechRecognition = new SpeechRecognition();
            this.#speechRecognition.continuous = true;
            this.#speechRecognition.interimResults = true;
            this.#speechRecognition.onresult = this.#handleSpeechRecognition;
            this.#speechRecognition.lang = navigator.language;
        } catch (e) {
            this.#speechRecognition = null;
        }

        /*
            Add necessary elements
        */
        const dropdown = appendSelection(this.container, 'div', { class: 'rn3-searchbar__dropdown' });
        const form = appendSelection(this.container, 'div', { class: 'rn3-searchbar__form' });
        const icon = appendSelection(form, 'div', { class: 'rn3-searchbar__form-icon' });
        const field = appendSelection(form, 'div', { class: 'rn3-searchbar__form-field' });
        const backspace = appendSelection(form, 'button', { class: 'rn3-searchbar__form-backspace', disabled: 'disabled' });
        const deleteBtn = appendSelection(form, 'button', { class: 'rn3-searchbar__form-delete-btn', disabled: 'disabled' });
        const mic = appendSelection(form, 'button', { class: 'rn3-searchbar__form-mic' });
        const input = appendSelection(field, 'input', { class: 'rn3-searchbar__form-input', placeholder: this.settings.input.placeholder });

        this.#elements = {
            field,
            backspace,
            deleteBtn,
            dropdown,
            input,
            form,
            icon,
            mic,
        };

        this.#elements.icon.html(this.settings.input.icon);
        this.#elements.backspace.html(this.settings.input.backspace);
        this.#elements.deleteBtn.html(this.settings.input.deleteBtn);
        this.#elements.mic.html(this.settings.input.mic);

        /*
            Add event listener
        */
        this.#elements.icon.on('click', this.#focusInput);
        this.#elements.field.on('click', this.#focusInput);
        this.#elements.input.on('keyup', this.#handleKeyUp);
        this.#elements.input.on('keydown', this.#preventDefault);

        this.#elements.backspace.on('click', () => {
            this.#setInputvalue();
            this.#focusInput();
            this.#closeDropdown();
            this.#hideBackspace();
        });

        this.#elements.deleteBtn.on('click', () => {
            this.data.values = [];
            this.update(this.data);
            this.dispatch('removed', null);
        });

        this.#elements.mic.on('click', () => {
            try {
                this.#speechRecognition.start();
            } catch (e) {
                this.#speechRecognition.stop();
            } finally {
                this.#focusInput();
            }
        });

        this.#elements.dropdown.on('mousemove', () => {
            this.#getDropdownItems()
                .style('pointer-events', null);
        });
    }

    #convertUrl = (url, params, value) => {
        const u = new URL(url);

        Object
            .keys(params)
            .forEach((key) => {
                const v = String(params[key]);

                if (v.includes('{query}')) {
                    u.searchParams.set(key, v.replace(/{query}/gi, () => value));
                }

                if (!v.includes('{query}')) {
                    u.searchParams.set(key, v);
                }
            });

        return u;
    };

    #fetchResults = async (value) => {
        const {
            request,
        } = this.settings;

        let errorOccured = false;

        this.#showBackspace();

        const url = this.#convertUrl(request.url, request.params, value);

        try {
            this.response = await fetch(url);
        } catch (error) {
            this.response = null;
            errorOccured = true;
        }

        try {
            this.responseData = await request.callback(this.response);
        } catch (error) {
            this.responseData = null;
            errorOccured = true;
        }

        this.#elements.dropdown
            .html(null)
            .classed('rn3-searchbar__dropdown--error', false)
            .classed('rn3-searchbar__dropdown--loading', false)
            .classed('rn3-searchbar__dropdown--no-results', false);

        if (isArrayOfObjects(this.responseData)) {
            const dropdownItems = this.#getDropdownItems()
                .data(this.responseData, this.getIdentity);

            dropdownItems
                .enter()
                .append('div')
                .attr('class', 'rn3-searchbar__dropdown-item')
                .merge(dropdownItems)
                .on('click', (e, datum) => {
                    this.#manageItemInput(datum);
                })
                .on('mouseenter', () => {
                    this.#getPreselectedDropdownItem()
                        .classed('rn3-searchbar__dropdown-item--preselected', false);
                })
                .style('pointer-events', 'none')
                .classed('rn3-searchbar__dropdown-item--preselected', (d, i) => i === 0)
                .classed('rn3-searchbar__dropdown-item--present', d => this.#getIndexOfDatum(d) !== -1)
                .html(d => `<span class="rn3-searchbar__dropdown-item-content">${this.settings.input.item.render(d)}</span>`);

            dropdownItems
                .exit()
                .remove();

            return;
        }

        if (!isArrayOfObjects(this.responseData) && errorOccured === true) {
            this.#elements.dropdown
                .html(request.error)
                .classed('rn3-searchbar__dropdown--error', true);

            return;
        }

        this.#elements.dropdown
            .html(request.noResults)
            .classed('rn3-searchbar__dropdown--no-results', true);
    };

    #fetchResultsDebounced = debounce((e) => {
        this.#fetchResults(e.target.value.trim());
    }, 500);

    update = (updatedData) => {
        this.data = {
            ...this.data,
            ...updatedData,
        };

        const inputItems = this.#getInputItems().data(this.data.values, this.getIdentity);

        inputItems
            .enter()
            .insert('div', 'input.rn3-searchbar__form-input')
            .attr('class', 'rn3-searchbar__form-item')
            .style('opacity', 0)
            .merge(inputItems)
            .on('click', (e, datum) => {
                const isRemoveBtn = select(e.target).classed('rn3-searchbar__form-item-remove');

                if (isRemoveBtn && datum) {
                    this.data.values = this.data.values || [];

                    const index = this.#getIndexOfDatum(datum);

                    this.data.values.splice(index, 1);

                    this.update(this.data);
                    this.dispatch('removed', datum);
                }
            })
            .html(d => `<span class="rn3-searchbar__form-item-content">${this.settings.input.item.render(d)}</span><span class="rn3-searchbar__form-item-remove"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" fill="currentColor" d="M13.41 12l4.3-4.29a1 1 0 10-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 00-1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 000 1.42 1 1 0 001.42 0l4.29-4.3 4.29 4.3a1 1 0 001.42 0 1 1 0 000-1.42z"/></svg></span>`)
            .transition()
            .duration(this.settings.transition.duration)
            .style('opacity', 1);

        inputItems
            .exit()
            .transition()
            .duration(this.settings.transition.duration)
            .style('opacity', 0)
            .remove();

        if (this.data.values.length > 0) {
            this.#showDeleteBtn();
        }

        if (this.data.values.length === 0) {
            this.#hideDeleteBtn();
        }
    };

    #handleSpeechRecognition = (event) => {
        if (typeof (event.results) === 'undefined') {
            this.#speechRecognition.stop();
            return;
        }

        this.#setInputvalue();

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) {
                this.#speechRecognition.stop();

                this.#elements.input.attr('placeholder', this.settings.input.placeholder);

                this.#focusInput();
                this.#setLoadingSequenceInDropdown();
                this.#setInputvalue(result[0].transcript.trim());
                this.#fetchResults(result[0].transcript.trim());

                this.#openDropdown();
            }

            if (!result.isFinal) {
                this.#elements.input.attr('placeholder', result[0].transcript.trim());
            }
        }
    };

    #handleKeyUp = (e) => {
        const keyCode = e.keyCode || e.which;
        const value = e.target.value.trim();

        /*
            No usable input, reset everything to default
        */
        if (value.length === 0) {
            this.#resetKeyCounter();
            this.#hideBackspace();
            this.#closeDropdown();
            this.#getDropdownItems().remove();

            return;
        }

        /*
            User will navigate through dropdown items
        */
        if (isNavigatingVertically(keyCode) && this.#getDropdownItems().data().length > 0) {
            if (isKey(keyCode, 'up')) this.#keyCounter -= 1;
            if (isKey(keyCode, 'down')) this.#keyCounter += 1;

            const listItems = this.#getDropdownItems();
            const listItemsSize = listItems.size();

            if (this.#keyCounter < 0) {
                this.#keyCounter += listItemsSize;
            }

            if (this.#keyCounter === listItemsSize) {
                this.#resetKeyCounter();
            }

            this.#getDropdownItems()
                .style('pointer-events', 'none');

            listItems
                .classed('rn3-searchbar__dropdown-item--preselected', (d, i) => i === this.#keyCounter);

            const p = this.#getPreselectedDropdownItem().node();
            const h = Number.parseInt(this.#elements.dropdown.style('height'), 10);

            if (p.offsetTop + h / 2 > h) {
                this.#elements.dropdown.node().scrollTop = p.offsetTop - h / 2;
                return;
            }

            this.#elements.dropdown.node().scrollTop = 0;

            return;
        }

        if (isNavigatingHorizontally(keyCode)) {
            return;
        }

        if (isKey(keyCode, 'enter')) {
            const datum = this.#getPreselectedDropdownItem().datum();

            this.#manageItemInput(datum);

            return;
        }

        this.#openDropdown();
        this.#fetchResultsDebounced(e);
        this.#setLoadingSequenceInDropdown();
    };

    #resetKeyCounter = () => {
        this.#keyCounter = 0;
    };

    #manageItemInput = (datum) => {
        this.data.values = this.data.values || [];

        const index = this.#getIndexOfDatum(datum);
        const datumAlreadyExists = index !== -1;

        if (!datumAlreadyExists) {
            this.data.values.push(datum);

            this.dispatch('added', datum);
        }

        if (datumAlreadyExists) {
            this.data.values.splice(index, 1);

            this.dispatch('removed', datum);
        }

        this.#closeDropdown();
        this.#focusInput();
        this.#hideBackspace();
        this.#resetKeyCounter();
        this.#setInputvalue();
        this.update(this.data);
    };

    #preventDefault = (e) => {
        const keyCode = e.keyCode || e.which;

        if (isKey(keyCode, 'up')) e.preventDefault();
        if (isKey(keyCode, 'down')) e.preventDefault();
    };

    #setLoadingSequenceInDropdown = () => {
        this.#elements.dropdown
            .html(this.settings.request.loading)
            .classed('rn3-searchbar__dropdown--error', false)
            .classed('rn3-searchbar__dropdown--loading', true);
    };

    #setInputvalue = (val = '') => {
        this.#elements.input.node().value = val;
    };

    #focusInput = () => {
        this.#elements.input.node().focus();
    };

    #getInputItems = () => getChildrenFromSelection(
        this.#elements.field,
        'div.rn3-searchbar__form-item',
    );

    #getDropdownItems = () => getChildrenFromSelection(
        this.#elements.dropdown,
        'div.rn3-searchbar__dropdown-item',
    );

    #getPreselectedDropdownItem = () => this.#elements.dropdown
        .select('.rn3-searchbar__dropdown-item--preselected');

    #getIndexOfDatum = datum => (this.data.values || [])
        .findIndex(d => this.getIdentity(d) === this.getIdentity(datum));

    #hideBackspace = () => {
        this.#toggleBackspace(false);
    };

    #showBackspace = () => {
        this.#toggleBackspace(true);
    };

    #toggleBackspace = (show) => {
        this.#elements.backspace
            .attr('disabled', show === true ? null : 'disabled');
    };

    #hideDeleteBtn = () => {
        this.#toggleDeleteBtn(false);
    };

    #showDeleteBtn = () => {
        this.#toggleDeleteBtn(true);
    };

    #toggleDeleteBtn = (show) => {
        this.#elements.deleteBtn
            .attr('disabled', show === true ? null : 'disabled');
    };

    #openDropdown = () => {
        this.#toggleDropdown(true);
    };

    #closeDropdown = () => {
        this.#toggleDropdown(false);
    };

    #toggleDropdown = (open) => {
        this.#elements.dropdown
            .classed('rn3-searchbar__dropdown--open', open);
    };
}
