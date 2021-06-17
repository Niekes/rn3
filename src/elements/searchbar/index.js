import {
    select,
} from 'd3';

import Element from '../Element';

import {
    setMultiStyles,
    appendSelection,
    getChildrenFromSelection,
} from '../../utils/selection';

import {
    debounce,
} from '../../utils/function';

import {
    checkSpeechRecognition,
} from '../../utils/speech-recognition';

import {
    has,
} from '../../utils/object';

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
    #initialKeyCount;

    #keyCounter;

    #tmpValue;

    #elements;

    #speechRecognition;

    constructor(data) {
        super(data, defaultSettings);

        this.#initialKeyCount = this.settings.form.freeText ? -1 : 0;
        this.#keyCounter = this.#initialKeyCount;

        this.#speechRecognition = checkSpeechRecognition({
            settings: this.settings.speechRecognition,
            onresult: this.#speechRecognitionResult,
            onerror: this.#speechRecognitionError,
            onnomatch: this.#speechRecognitionNoMatch,
            onspeechend: this.#speechRecognitionSpeechEnd,
        });

        Element.container.classed('rn3-searchbar--mode-1', !this.settings.form.freeText && !this.#speechRecognition);
        Element.container.classed('rn3-searchbar--mode-2', this.settings.form.freeText && !this.#speechRecognition);
        Element.container.classed('rn3-searchbar--mode-3', this.settings.form.freeText && this.#speechRecognition);
        Element.container.classed('rn3-searchbar--mode-4', !this.settings.form.freeText && this.#speechRecognition);

        /*
            Add necessary elements
        */
        const dropdown = appendSelection(Element.container, 'div', { class: 'rn3-searchbar__dropdown' });
        const form = appendSelection(Element.container, 'div', { class: 'rn3-searchbar__form' });
        const icon = appendSelection(form, 'div', { class: 'rn3-searchbar__form-icon' });
        const field = appendSelection(form, 'div', { class: 'rn3-searchbar__form-field' });
        const backspace = appendSelection(form, 'button', { class: 'rn3-searchbar__form-backspace', disabled: 'disabled' });
        const clearBtn = appendSelection(form, 'button', { class: 'rn3-searchbar__form-clear-btn', disabled: 'disabled' });
        const mic = appendSelection(form, 'button', { class: 'rn3-searchbar__form-mic' });
        const input = appendSelection(field, 'input', { class: 'rn3-searchbar__form-input', placeholder: this.settings.form.placeholder });

        this.#elements = {
            field,
            backspace,
            clearBtn,
            dropdown,
            input,
            form,
            icon,
            mic,
        };

        this.#elements.icon.html(this.settings.form.icon);
        this.#elements.backspace.html(this.settings.form.backspace);
        this.#elements.clearBtn.html(this.settings.form.clearBtn);
        this.#elements.mic.html(this.settings.form.mic);

        /*
            Add event listener
        */
        this.#elements.icon.on('click', this.#focusInput);
        this.#elements.field.on('click', this.#focusInput);
        this.#elements.input.on('keyup', this.#handleKeyUp);
        this.#elements.input.on('focus', () => this.dispatch('focus'));
        this.#elements.input.on('blur', () => this.dispatch('blur'));
        this.#elements.input.on('keydown', this.#preventDefault);

        this.#elements.backspace.on('click', () => {
            this.#setInputValue();
            this.#focusInput();
            this.#closeDropdown();
            this.#hideBackspace();

            if (this.settings.form.freeText) {
                this.data.values = [];
                this.update(this.data);
                this.dispatch('removed', null);
            }
        });

        this.#elements.clearBtn.on('click', () => {
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

        this.on('outside-click', () => {
            this.#closeDropdown();
            this.#hideBackspace();
            this.#resetKeyCounter();
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
            this.response = await fetch(url, request.interceptor(request.options));
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
                .classed('rn3-searchbar__dropdown-item--preselected', (d, i) => i === this.#keyCounter)
                .classed('rn3-searchbar__dropdown-item--present', d => this.#getIndexOfDatum(d) !== -1)
                .html(d => `<span class="rn3-searchbar__dropdown-item-content">${this.settings.dropdown.item.render(d)}</span>`);

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

        if (!this.settings.form.freeText) {
            const inputItems = this.#getInputItems().data(this.data.values, this.getIdentity);

            inputItems
                .enter()
                .insert('div', 'input.rn3-searchbar__form-input')
                .attr('class', 'rn3-searchbar__form-item')
                .style('opacity', 0)
                .each((d, i, nodes) => {
                    if (has(d, 'styles')) {
                        return setMultiStyles(select(nodes[i]), d.styles);
                    }

                    return null;
                })
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
                .html(d => `<span class="rn3-searchbar__form-item-content">${this.settings.form.item.render(d)}</span><span class="rn3-searchbar__form-item-remove"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" fill="currentColor" d="M13.41 12l4.3-4.29a1 1 0 10-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 00-1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 000 1.42 1 1 0 001.42 0l4.29-4.3 4.29 4.3a1 1 0 001.42 0 1 1 0 000-1.42z"/></svg></span>`)
                .transition()
                .duration(this.settings.transition.duration)
                .ease(this.settings.transition.ease)
                .delay(this.settings.transition.delay)
                .style('opacity', 1);

            inputItems
                .exit()
                .style('max-width', (d, i, nodes) => `${nodes[i].offsetWidth}px`)
                .transition()
                .duration(this.settings.transition.duration)
                .ease(this.settings.transition.ease)
                .delay(this.settings.transition.delay)
                .style('opacity', 0)
                .style('max-width', '0px')
                .style('padding', '0px')
                .style('border-width', '0px')
                .remove();
        }

        if (this.settings.form.freeText) {
            if (this.data.values.length === 0) {
                this.#setInputValue('');
            }

            if (this.data.values.length !== 0) {
                this.#setInputValue(this.settings.form.item.render(this.data.values[0]));
            }
        }

        if (this.data.values.length > 0) {
            this.#showClearBtn();
        }

        if (this.data.values.length === 0) {
            this.#hideClearBtn();
        }

        if (this.#elements.input.node().value.length > 0) {
            this.#showBackspace();
        }

        if (this.#elements.input.node().value.length === 0) {
            this.#hideBackspace();
        }
    };

    #speechRecognitionResult = (event) => {
        if (typeof (event.results) === 'undefined') {
            this.#speechRecognition.stop();
            return;
        }

        this.#setInputValue();

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) {
                this.#speechRecognition.stop();

                this.#elements.input.attr('placeholder', this.settings.form.placeholder);

                this.#focusInput();
                this.#setLoadingSequenceInDropdown();
                this.#setInputValue(result[0].transcript.trim());
                this.#fetchResults(result[0].transcript.trim());

                this.#openDropdown();
            }

            if (!result.isFinal) {
                this.#elements.input.attr('placeholder', result[0].transcript.trim());
            }
        }
    };

    #speechRecognitionError = () => { console.log('ERROR'); };

    #speechRecognitionNoMatch = () => { console.log('NO MATCH'); };

    #speechRecognitionSpeechEnd = () => { console.log('SPEECH END'); };

    #handleKeyUp = (e) => {
        const keyCode = e.keyCode || e.which;
        const value = e.target.value.trim();

        const {
            freeText,
        } = this.settings.form;

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

        if (freeText && !(isNavigatingVertically(keyCode) || isNavigatingHorizontally(keyCode))) {
            this.#tmpValue = value;
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
                this.#keyCounter += this.#initialKeyCount
                    ? listItemsSize + 1
                    : listItemsSize;
            }

            if (this.#keyCounter === listItemsSize) {
                this.#resetKeyCounter();
            }

            this.#getDropdownItems()
                .style('pointer-events', 'none');

            listItems
                .classed('rn3-searchbar__dropdown-item--preselected', (d, i) => i === this.#keyCounter);

            if (freeText && this.#keyCounter !== -1) {
                this.#setInputValue(
                    this.settings.form.item.render(
                        this.#getPreselectedDropdownItem().datum(),
                    ),
                );
            }

            if (freeText && this.#keyCounter === -1) {
                this.#setInputValue(this.#tmpValue);
            }

            const p = this.#getPreselectedDropdownItem().node();
            const h = Number.parseInt(this.#elements.dropdown.style('height'), 10);


            if (p && (p.offsetTop + h / 2 > h)) {
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
            const preselectedItem = this.#getPreselectedDropdownItem();

            if (preselectedItem.empty()) {
                console.log('TODO: HANDLE EMPTY');
            }

            if (!preselectedItem.empty()) {
                const datum = preselectedItem.datum();

                this.#manageItemInput(datum);
            }

            return;
        }

        this.#openDropdown();
        this.#fetchResultsDebounced(e);
        this.#setLoadingSequenceInDropdown();
    };

    #resetKeyCounter = () => {
        this.#keyCounter = this.#initialKeyCount;
    };

    #manageItemInput = (datum) => {
        this.data.values = this.data.values || [];

        const index = this.#getIndexOfDatum(datum);
        const datumAlreadyExists = index !== -1;

        const {
            freeText,
        } = this.settings.form;

        if (!datumAlreadyExists) {
            if (freeText) {
                this.data.values = [datum];
            }

            if (!freeText) {
                this.data.values.push(datum);
            }

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
        this.#setInputValue();
        this.update(this.data);
    };

    #preventDefault = (e) => {
        const keyCode = e.keyCode || e.which;

        if (isNavigatingVertically(keyCode)) {
            if (e.repeat) {
                this.#handleKeyUp(e);
            }

            e.preventDefault();
        }
    };

    #setLoadingSequenceInDropdown = () => {
        this.#elements.dropdown
            .html(this.settings.request.loading)
            .classed('rn3-searchbar__dropdown--error', false)
            .classed('rn3-searchbar__dropdown--loading', true);
    };

    #setInputValue = (val = '') => {
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

    #hideClearBtn = () => {
        this.#toggleClearBtn(false);
    };

    #showClearBtn = () => {
        this.#toggleClearBtn(true);
    };

    #toggleClearBtn = (show) => {
        this.#elements.clearBtn
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

        if (!open) {
            this.#elements.dropdown.html(null);
        }
    };
}
