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

import defaultSettings from './default-settings';

export default class Searchbar extends Element {
    constructor(data) {
        super(data, defaultSettings);

        /*
            SpeechRecognition
        */
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = true;
            this.speechRecognition.onresult = this.handleSpeechRecognition;
        } catch (e) {
            this.speechRecognition = null;
        }

        /*
            Add necessary elements
        */
        const dropdownGroup = appendSelection(this.container, 'div', { class: 'rn3-searchbar__dropdown-group' });
        const inputGroup = appendSelection(this.container, 'div', { class: 'rn3-searchbar__input-group' });
        const pre = appendSelection(inputGroup, 'div', { class: 'rn3-searchbar__input-group-pre' });
        const area = appendSelection(inputGroup, 'div', { class: 'rn3-searchbar__input-group-area' });
        const suf = appendSelection(inputGroup, 'div', { class: 'rn3-searchbar__input-group-suf' });
        const mic = appendSelection(inputGroup, 'div', { class: 'rn3-searchbar__input-group-mic' });
        const entry = appendSelection(area, 'input', { class: 'rn3-searchbar__input-area-entry', placeholder: this.settings.input.placeholder });

        this.elements = {
            input: {
                pre,
                area,
                group: inputGroup,
                suf,
                entry,
                mic,
            },
            dropdown: {
                group: dropdownGroup,
            },
        };

        this.elements.input.pre.html(this.settings.input.pre);
        this.elements.input.suf.html(this.settings.input.suf);
        this.elements.input.mic.html(this.settings.input.mic);

        /*
            Add event listener
        */
        this.elements.input.area.on('click', this.focusInput);
        this.elements.input.entry.on('keyup', (e) => {
            this.elements.dropdown.group
                .html('...')
                .classed('rn3-searchbar__dropdown-group--error', false)
                .classed('rn3-searchbar__dropdown-group--loading', true);

            this.openDropdown();
            this.fetchResultsDebounced(e);
        });

        this.elements.input.mic.on('click', () => {
            try {
                this.speechRecognition.start();
            } catch (e) {
                this.speechRecognition.stop();
            } finally {
                this.focusInput();
            }
        });

        this.elements.input.suf.on('click', () => {
            this.setInputvalue();
            this.focusInput();
            this.closeDropdown();
            this.hideBackspace();
        });
    }

    convertUrl = (url, params, value) => {
        const u = new URL(url);

        Object
            .keys(params)
            .forEach((key) => {
                const v = String(params[key]);

                if (v.includes('{query}')) {
                    u.searchParams.set(key, value.replace(/{query}/gi, () => value.trim()));
                }

                if (!v.includes('{query}')) {
                    u.searchParams.set(key, v);
                }
            });

        return u;
    };

    fetchResults = async (v) => {
        const {
            request,
        } = this.settings;

        const value = v.trim();
        let errorOccured = false;

        if (!value) {
            this.hideBackspace();
            this.closeDropdown();
            this.getDropdownItems().remove();

            return;
        }

        this.showBackspace();

        const url = this.convertUrl(request.url, request.params, value);

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

        if (isArrayOfObjects(this.responseData)) {
            const dropdownItems = this.getDropdownItems().data(this.responseData, this.getIdentity);

            dropdownItems
                .enter()
                .append('div')
                .attr('class', 'rn3-searchbar__dropdown-group-item')
                .merge(dropdownItems)
                .on('click', (event, datum) => {
                    this.data.values = this.data.values || [];

                    const index = this.data.values
                        .findIndex(d => this.getIdentity(d) === this.getIdentity(datum));

                    if (index === -1) {
                        this.data.values.push(datum);
                        this.update(this.data);
                        this.setInputvalue();
                        this.focusInput();
                        this.closeDropdown();
                        this.hideBackspace();
                    }
                })
                .html(d => this.settings.dropdown.item.render(d));

            dropdownItems
                .exit()
                .remove();

            return;
        }

        if (!isArrayOfObjects(this.responseData) && errorOccured === true) {
            this.elements.dropdown.group
                .html(request.error)
                .classed('rn3-searchbar__dropdown-group--error', true);

            return;
        }

        this.elements.dropdown.group
            .html(request.noResults)
            .classed('rn3-searchbar__dropdown-group--no-results', true);
    };

    fetchResultsDebounced = debounce((e) => {
        this.fetchResults(e.target.value);
    }, 500);

    update = (updatedData) => {
        this.data = {
            ...this.data,
            ...updatedData,
        };

        const inputItems = this.getInputItems().data(this.data.values, this.getIdentity);

        inputItems
            .enter()
            .insert('div', 'input.rn3-searchbar__input-area-entry')
            .attr('class', 'rn3-searchbar__input-group-item')
            .merge(inputItems)
            .on('click', (e, datum) => {
                const isCloseBtn = select(e.target).classed('rn3-searchbar__input-group-item-close');

                if (isCloseBtn && datum) {
                    this.data.values = this.data.values || [];

                    const index = this.data.values
                        .findIndex(d => this.getIdentity(d) === this.getIdentity(datum));

                    this.data.values.splice(index, 1);

                    this.update(this.data);
                }
            })
            .html(d => `<span class="rn3-searchbar__input-group-item-content">${d.display_name}</span><span class="rn3-searchbar__input-group-item-close"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" fill="currentColor" d="M13.41 12l4.3-4.29a1 1 0 10-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 00-1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 000 1.42 1 1 0 001.42 0l4.29-4.3 4.29 4.3a1 1 0 001.42 0 1 1 0 000-1.42z"/></svg></span>`);

        inputItems
            .exit()
            .remove();
    };

    handleSpeechRecognition = (event) => {
        if (typeof (event.results) === 'undefined') {
            this.speechRecognition.stop();
            return;
        }

        this.setInputvalue();

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) {
                this.speechRecognition.stop();
                this.focusInput();
                this.elements.input.entry.attr('placeholder', this.settings.input.placeholder);
                this.setInputvalue(result[0].transcript.trim());
                this.fetchResults(result[0].transcript);
            }

            if (!result.isFinal) {
                this.elements.input.entry.attr('placeholder', result[0].transcript.trim());
            }
        }
    };

    setInputvalue = (val = '') => {
        this.elements.input.entry.node().value = val;
    };

    focusInput = () => {
        this.elements.input.entry.node().focus();
    };

    getInputItems = () => getChildrenFromSelection(
        this.elements.input.area,
        'div.rn3-searchbar__input-group-item',
    );

    getDropdownItems = () => getChildrenFromSelection(
        this.elements.dropdown.group,
        'div.rn3-searchbar__dropdown-group-item',
    );

    hideBackspace = () => {
        this.toggleBackspace(false);
    };

    showBackspace = () => {
        this.toggleBackspace(true);
    };

    toggleBackspace = (open) => {
        this.elements.input.suf
            .classed('rn3-searchbar__input-group-suf--visible', open);
    };

    openDropdown = () => {
        this.toggleDropdown(true);
    };

    closeDropdown = () => {
        this.toggleDropdown(false);
    };

    toggleDropdown = (open) => {
        this.elements.dropdown.group
            .classed('rn3-searchbar__dropdown-group--open', open);
    };
}
