<template>
    <div
        :class="wrapperClasses"
        v-clickoutside="onClickOutside"
        @keydown.esc="onEscape"
        @keydown.down="onDown"
        @keydown.up="onUp"
        @keydown.enter="onEnter"
    >
        <div
            :class="selectionClasses"
            :tabindex="selectionTabindex"
            ref="reference"
            @click="toggleMenu"
            @keydown.up="selectionOnUpDown"
            @keydown.down="selectionOnUpDown"
            @keydown.tab="selectionOnTab"
            @keydown.delete="selectionOnDelete"
            @blur="selectionSetFocus(false)"
            @focus="selectionSetFocus(true)"
        >
            <slot name="input">
                <input
                    type="hidden"
                    :name="name"
                    :value="model"
                >
                <div
                    class="ivu-tag ivu-tag-checked"
                    v-for="(item, index) in selectedMultiple"
                    :key="JSON.stringify(item)"
                >
                    <span class="ivu-tag-text">{{item.label}}</span>
                    <Icon
                        type="ios-close-empty"
                        @click.native.stop="removeTag(index)"
                    ></Icon>
                </div>
                <span
                    v-show="isPlaceholderVisible"
                    :class="placeholderClasses"
                >{{localePlaceholder}}</span>
                <span
                    v-show="isSelectedValueVisible"
                    :class="selectedValueClasses"
                >{{selectedSingle}}</span>
                <input
                    v-if="filterable"
                    ref="input"
                    type="text"
                    v-model="query"
                    autocomplete="off"
                    spellcheck="false"
                    :id="elementId"
                    :disabled="disabled"
                    :class="inputClasses"
                    :placeholder="placeholderText"
                    :style="inputStyle"
                    @blur="inputOnBlur"
                    @focus="inputOnFocus"
                    @keydown="resetInputState"
                    @keydown.delete="inputOnDelete"
                >
                <Icon
                    v-show="isCloseIconVisible"
                    type="ios-close"
                    :class="arrowIconClasses"
                    @click.native.stop="clearSingleSelect"
                ></Icon>
                <Icon
                    v-if="!remote"
                    type="arrow-down-b"
                    :class="arrowIconClasses"
                ></Icon>
            </slot>
        </div>
        <transition :name="transitionName">
            <Drop
                v-show="isDropdownVisible"
                ref="dropdown"
                :class="dropdownClasses"
                :placement="placement"
                :data-transfer="transfer"
                v-transfer-dom
            >
                <ul
                    v-show="isNotFoundVisible"
                    :class="notFoundClasses"
                >
                    <li>{{localeNotFoundText}}</li>
                </ul>
                <ul
                    v-show="isDropdownListVisible"
                    :class="dropdownListClasses"
                >
                    <slot></slot>
                </ul>
                <ul
                    v-show="loading"
                    :class="loadingClasses"
                >
                    {{localeLoadingText}}
                </ul>

            </Drop>
        </transition>
    </div>
</template>

<script>
    import SELECT_NAME from './selectName';
    import DROPDOWN_NAME from './dropdownName';
    import FORMITEM_NAME from '@/components/form/formItemName';
    import OPTION_NAME from './optionName';
    import OPTIONGROUP_NAME from './optionGroupName';
    import PREFIXCLS from './prefixCls';
    import Icon from '@/components/icon';
    import Drop from './dropdown.vue';
    import clickoutside from '@/directives/clickoutside';
    import TransferDom from '@/directives/transfer-dom';
    import {
        findComponentDownward,
        getStyle,
        kebabJoin,
        oneOf,
    } from '@/utils/assist';
    import Emitter from '@/mixins/emitter';
    import Locale from '@/mixins/locale';
    import {
        AUTO,
        ARROW,
        BOTTOM,
        CLEAR,
        COMPLETE,
        DISABLED,
        DOWN,
        DROPDOWN,
        EMPTY_STRING,
        FOCUSED,
        FOUND,
        INPUT,
        IVU,
        LIST,
        LOADING,
        PLACEHOLDER,
        SLIDE,
        MULTIPLE,
        NEXT,
        NOT,
        PREV,
        SELECTED,
        SELECTION,
        SHOW,
        SINGLE,
        TRANSFER,
        UP,
        VALUE,
        VISIBLE,
    } from '@/utils/constants';
    import {
        IGNORE_KEY_LIST,
        PLACEMENT_LIST,
        SMALL_LARGE_DEFAULT_LIST,
        STRING_NUMBER_ARRAY_LIST,
    } from '@/utils/enums';
    import {
        EVENT_APPEND,
        EVENT_ON_CHANGE,
        EVENT_ON_DESTROY_POPPER,
        EVENT_ON_FORM_CHANGE,
        EVENT_ON_QUERY_CHANGE,
        EVENT_ON_SELECT_CLOSE,
        EVENT_ON_SELECT_SELECTED,
        EVENT_ON_UPDATE_POPPER,
        EVENT_REMOVE,
    } from '@/utils/eventNames';
    import {
        debounce,
        isUniq,
        isUniqOptions,
        uniq,
    } from './utils';

    const INPUT_LENGTH = 20;
    const prefixCls = PREFIXCLS;

    export default {
        name: SELECT_NAME,

        components: {Icon, Drop},

        directives: {clickoutside, TransferDom},

        mixins: [Emitter, Locale],

        props: {
            // Use for AutoComplete
            autoComplete: {
                default: false,
                type: Boolean,
            },
            clearable: {
                default: false,
                type: Boolean,
            },
            disabled: {
                default: false,
                type: Boolean,
            },
            elementId: {
                default: undefined,
                type: String,
            },
            filterable: {
                default: false,
                type: Boolean,
            },
            filterMethod: {
                type: Function,
                default: undefined,
            },
            // 使用时，也得设置 value 才行
            label: {
                default: EMPTY_STRING,
                type: STRING_NUMBER_ARRAY_LIST,
            },
            labelInValue: {
                default: false,
                type: Boolean,
            },
            loading: {
                default: false,
                type: Boolean,
            },
            loadingText: {
                default: undefined,
                type: String,
            },
            multiple: {
                default: false,
                type: Boolean,
            },
            placeholder: {
                default: undefined,
                type: String,
            },
            remote: {
                default: false,
                type: Boolean,
            },
            remoteMethod: {
                default: undefined,
                type: Function,
            },
            size: {
                default: undefined,
                type: String,
                validator(value){
                    return oneOf(value, SMALL_LARGE_DEFAULT_LIST);
                },
            },
            name: {
                default: undefined,
                type: String,
            },
            notFoundText: {
                default: undefined,
                type: String,
            },
            placement: {
                default: BOTTOM,
                type: String,
                validator(value){
                    return oneOf(value, PLACEMENT_LIST);
                },
            },
            transfer: {
                default: false,
                type: Boolean,
            },
            value: {
                default: EMPTY_STRING,
                type: STRING_NUMBER_ARRAY_LIST,
            },
        },

        data(){
            const model = (() => {
                const isArray = Array.isArray(this.value);

                if (this.multiple) {
                    return isArray ? uniq(this.value) : [];
                }

                return isArray ? EMPTY_STRING : this.value;
            })();

            return {
                currentLabel: this.label,
                focused: false,
                focusIndex: 0,
                inputLength: INPUT_LENGTH,
                lastQuery: EMPTY_STRING,
                model,
                notFound: false,
                options: [],
                optionInstances: [],
                query: EMPTY_STRING,
                // When select an option, set this first and set query, because query is watching,
                // it will emit event
                selectToChangeQuery: false,
                selectedSingle: EMPTY_STRING, // label
                selectedMultiple: [],
                // if slot change duration and in multiple, set true and after slot change, set false
                slotChangeDuration: false,
                visible: false,
            };
        },

        computed: {
            arrowIconClasses(){
                return [
                    kebabJoin(prefixCls, ARROW),
                ];
            },

            dropdownClasses(){
                return {
                    [kebabJoin(IVU, AUTO, COMPLETE)]: this.autoComplete,
                    [kebabJoin(prefixCls, DROPDOWN, TRANSFER)]: this.transfer,
                    [kebabJoin(prefixCls, MULTIPLE)]: this.multiple && this.transfer,
                };
            },

            dropdownListClasses(){
                return [
                    kebabJoin(prefixCls, DROPDOWN, LIST),
                ];
            },

            getOptions(){
                return this.$slots.default || [];
            },

            inputClasses(){
                return [
                    kebabJoin(prefixCls, INPUT),
                ];
            },

            inputStyle(){
                if (this.multiple) {
                    return {
                        width: this.showPlaceholder ? '100%' : `${this.inputLength}px`,
                    };
                }

                return {};
            },

            isCloseIconVisible(){
                return !this.multiple && this.clearable && !this.showPlaceholder;
            },

            isDropdownVisible(){
                if (!this.visible) {
                    return false;
                }

                if (!this.autoComplete || this.getOptions.length) {
                    return true;
                }

                return this.loading && !this.remote && this.query !== EMPTY_STRING;
            },

            isDropdownListVisible(){
                return (!this.notFound && !this.remote) || (this.remote && !this.loading && !this.notFound);
            },


            isNotFoundVisible(){
                return this.remote ? !this.loading && !this.getOptions.length : this.notFound;
            },

            isPlaceholderVisible(){
                return this.showPlaceholder && !this.filterable;
            },

            isSelectedValueVisible(){
                return !this.showPlaceholder && !this.multiple && !this.filterable;
            },

            loadingClasses(){
                return [
                    kebabJoin(prefixCls, LOADING),
                ];
            },

            localeLoadingText(){
                return this.loadingText === undefined ? this.t('i.select.loading') :  this.loadingText;
            },

            localeNotFoundText(){
                return this.notFoundText === undefined ? this.t('i.select.noMatch') : this.notFoundText;
            },

            localePlaceholder(){
                return this.placeholder === undefined ?
                    this.t('i.select.placeholder') :
                    this.placeholder;
            },

            notFoundClasses(){
                return [
                    kebabJoin(prefixCls, NOT, FOUND),
                ];
            },

            placeholderClasses(){
                return [
                    kebabJoin(prefixCls, PLACEHOLDER),
                ];
            },

            placeholderText(){
                return this.showPlaceholder ? this.localePlaceholder : EMPTY_STRING;
            },

            selectedValueClasses(){
                return [
                    kebabJoin(prefixCls, SELECTED, VALUE),
                ];
            },

            selectionClasses(){
                return {
                    [kebabJoin(prefixCls, SELECTION)]: !this.autoComplete,
                };
            },

            showPlaceholder(){
                if (typeof this.model === 'string') {
                    return this.model === EMPTY_STRING;
                }

                return Array.isArray(this.model) ? !this.model.length : this.model === null;
            },

            selectionTabindex(){
                return this.disabled || this.filterable ? -1 : 0;
            },

            transitionName(){
                return this.placement === BOTTOM ? kebabJoin(SLIDE, UP) : kebabJoin(SLIDE, DOWN);
            },

            wrapperClasses(){
                return [
                    prefixCls,
                    {

                        [kebabJoin(prefixCls, DISABLED)]: this.disabled,
                        [kebabJoin(prefixCls, FOCUSED)]: !this.visible && this.focused,
                        [kebabJoin(prefixCls, MULTIPLE)]: this.multiple,
                        [kebabJoin(prefixCls, SINGLE)]: !this.multiple,
                        [kebabJoin(prefixCls, SHOW, CLEAR)]: this.isCloseIconVisible,
                        [kebabJoin(prefixCls, this.size)]: !!this.size,
                        [kebabJoin(prefixCls, VISIBLE)]: this.visible,
                    },
                ];
            },
        },

        watch: {
            label(val){
                this.currentLabel = val;
                this.updateLabel();
            },

            model(){
                this.$emit(INPUT, this.model);
                this.modelToQuery();

                if (this.multiple) {
                    if (this.slotChangeDuration) {
                        this.slotChangeDuration = false;
                    } else {
                        this.updateMultipleSelected();
                    }
                } else {
                    this.updateSingleSelected();
                }

                // #957
                if (!this.visible && this.filterable) {
                    this.$nextTick(() => {
                        this.broadcastQuery(EMPTY_STRING);
                    });
                }
            },

            options(){
                if (!isUniqOptions(this.options)) {
                    // eslint-disable-next-line no-console
                    console.warn('[iview] i-options are not unique, this may cause problems.');
                }
            },

            query(val){
                if (this.remote && this.remoteMethod) {
                    if (!this.selectToChangeQuery) {
                        this.$emit(EVENT_ON_QUERY_CHANGE, val);
                        this.remoteMethod(val);
                    }

                    this.focusIndex = 0;
                    this.findChild((child) => {
                        child.isFocus = false;
                    });
                } else {
                    if (!this.selectToChangeQuery) {
                        this.$emit(EVENT_ON_QUERY_CHANGE, val);
                    }

                    this.broadcastQuery(val);

                    this.$nextTick(() => {
                        let isHidden = true;

                        this.findChild((child) => {
                            if (!child.hidden) {
                                isHidden = false;
                            }
                        });

                        this.notFound = isHidden;
                    });
                }

                this.selectToChangeQuery = false;
                this.broadcast(DROPDOWN_NAME, EVENT_ON_UPDATE_POPPER);
            },

            value(val){
                this.model = val;

                // #982
                if (val === EMPTY_STRING || val === null) {
                    this.query = EMPTY_STRING;
                }
            },

            visible(val){
                if (val) {
                    if (this.filterable) {
                        if (this.multiple) {
                            this.$refs.input.focus();
                        } else if (!this.autoComplete) {
                            this.$refs.input.select();
                        }

                        if (this.remote) {
                            this.findChild((child) => {
                                child.selected = this.multiple ? this.model.includes(child.value) : this.model === child.value;
                            });

                            // remote下，设置了默认值，第一次打开时，搜索一次
                            if (this.query !== EMPTY_STRING) {
                                const options = this.$slots.default || [];

                                if (!options.length) {
                                    this.remoteMethod(this.query);
                                }
                            }
                        }
                    }

                    this.broadcast(DROPDOWN_NAME, EVENT_ON_UPDATE_POPPER);
                } else {
                    if (this.filterable) {
                        // #566 reset options visible
                        setTimeout(() => {
                            this.broadcastQuery(EMPTY_STRING);
                        }, 300);
                    }

                    this.broadcast(DROPDOWN_NAME, EVENT_ON_DESTROY_POPPER);
                }
            },
        },

        created(){
            if (this.multiple) {
                if (!Array.isArray(this.value)) {
                    // eslint-disable-next-line no-console
                    console.warn('[iview] Multiple mode expects v-model to be an array.');
                } else if (!isUniq(this.value)) {
                    // eslint-disable-next-line no-console
                    console.warn('[iview] Multiple mode v-model contains duplicates.');
                }
            } else if (Array.isArray(this.value)) {
                // eslint-disable-next-line no-console
                console.warn('[iview] Single mode expects v-model to be a string or number.');
            }
        },

        mounted(){
            this.modelToQuery();
            // 处理 remote 初始值
            this.updateLabel();
            this.$nextTick(() => {
                this.broadcastQuery(EMPTY_STRING);
            });

            this.updateOptions();

            this.$on(EVENT_APPEND, this.debouncedAppendRemove());
            this.$on(EVENT_REMOVE, this.debouncedAppendRemove());

            this.$on(EVENT_ON_SELECT_SELECTED, (value) => {
                if (this.model === value) {
                    if (this.autoComplete) {
                        this.$emit(ON_CHANGE, value);
                    }

                    this.hideMenu();
                } else if (this.multiple) {
                    const index = this.model.findIndex(model => model === value);

                    if (index >= 0) {
                        this.removeTag(index);
                    } else {
                        this.model.push(value);
                        this.broadcast(DROPDOWN_NAME, EVENT_ON_UPDATE_POPPER);
                    }

                    if (this.filterable) {
                        // remote&filterable&multiple时，一次点多项，不应该设置true，
                        // 因为无法置为false，下次的搜索会失效
                        if (this.query !== EMPTY_STRING) {
                            this.selectToChangeQuery = true;
                        }

                        this.query = EMPTY_STRING;
                    }
                } else {
                    this.model = value;

                    if (this.filterable) {
                        this.findChild((child) => {
                            if (child.value === value) {
                                if (this.query !== EMPTY_STRING) {
                                    this.selectToChangeQuery = true;
                                }

                                this.query = child.label === undefined ?
                                    child.searchLabel :
                                    child.label;

                                this.lastQuery = this.query;
                            }
                        });
                    }
                }

                this.focusElement();
            });
        },

        methods: {
            broadcastQuery(val){
                if (findComponentDownward(this, OPTIONGROUP_NAME)) {
                    this.broadcast(OPTIONGROUP_NAME, EVENT_ON_QUERY_CHANGE, val);
                }

                this.broadcast(OPTION_NAME, EVENT_ON_QUERY_CHANGE, val);
            },

            clearSingleSelect(){
                if (this.isCloseIconVisible) {
                    this.findChild((child) => {
                        child.selected = false;
                    });

                    this.model = EMPTY_STRING;

                    if (this.filterable) {
                        this.query = EMPTY_STRING;
                    }
                }
            },

            debouncedAppendRemove(){
                const appendRemove = () => {
                    if (!this.remote) {
                        this.modelToQuery();
                        this.$nextTick(() => this.broadcastQuery(EMPTY_STRING));
                    } else {
                        this.findChild((child) => {
                            child.updateSearchLabel(); // #1865
                            child.selected = this.multiple ? this.model.includes(child.value) : this.model === child.value;
                        });
                    }

                    this.slotChange();
                    this.updateOptions(true);
                };

                return debounce(appendRemove);
            },

            // find option component
            findChild(cb){
                const find = (child) => {
                    if (child.$options.name === OPTION_NAME) {
                        cb(child);
                    } else if (child.$children.length) {
                        child.$children.forEach(find);
                    }
                };

                const instances = this.optionInstances.length ? this.optionInstances : this.$children;

                return instances.forEach(find);
            },

            focusElement(){
                const ref = this.filterable ? this.$refs.input : this.$refs.reference;

                ref.focus();
            },

            hideMenu(){
                this.visible = false;
                this.focusIndex = 0;
                this.broadcast(OPTION_NAME, EVENT_ON_SELECT_CLOSE);
            },

            inputOnBlur(){
                this.focused = false;

                if (this.disabled) {
                    return;
                }

                setTimeout(() => {
                    if (this.autoComplete) {
                        return;
                    }

                    if (this.multiple) {
                        this.query = EMPTY_STRING;
                    } else if (this.model !== EMPTY_STRING) {
                        this.findChild(({label, searchLabel, value}) => {
                            if (value === this.model) {
                                this.query = label === undefined ? searchLabel : label;
                            }
                        });

                        // 如果删除了搜索词，下拉列表也清空了，所以强制调用一次remoteMethod
                        if (this.remote && this.query !== this.lastQuery) {
                            this.$nextTick(() => {
                                this.query = this.lastQuery;
                            });
                        }
                    } else {
                        this.query = EMPTY_STRING;
                    }
                }, 300);
            },

            inputOnDelete(){
                if (this.multiple && this.query === EMPTY_STRING && this.model.length) {
                    this.removeTag(this.model.length - 1);
                }
            },

            inputOnFocus(){
                if (this.disabled || !this.filterable) {
                    return;
                }

                this.focused = true;
            },

            modelToQuery(){
                if (!this.multiple && this.filterable && this.model !== undefined) {
                    this.findChild((child) => {
                        if (this.model === child.value) {
                            if (child.label) {
                                this.query = child.label;
                            } else if (child.searchLabel) {
                                this.query = child.searchLabel;
                            } else {
                                this.query = child.value;
                            }
                        }
                    });
                }
            },

            navigateOptions(direction){
                if (direction === NEXT) {
                    this.focusIndex =
                        this.focusIndex === this.options.length ? 1 : this.focusIndex + 1;
                } else if (direction === PREV) {
                    this.focusIndex =
                        this.focusIndex <= 1 ? this.options.length : this.focusIndex - 1;
                }

                const childStatus = {
                    disabled: false,
                    hidden: false,
                };

                let findDeep = false; // can next find allowed

                this.findChild((child) => {
                    if (child.index === this.focusIndex) {
                        childStatus.disabled = child.disabled;
                        childStatus.hidden = child.hidden;

                        if (!child.disabled && !child.hidden) {
                            child.isFocus = true;
                        }
                    } else {
                        child.isFocus = false;
                    }

                    if (!child.hidden && !child.disabled) {
                        findDeep = true;
                    }
                });

                this.resetScrollTop();

                if ((childStatus.disabled || childStatus.hidden) && findDeep) {
                    this.navigateOptions(direction);
                }
            },

            onClickOutside(e){
                if (this.visible) {
                    e.stopPropagation();
                    this.hideMenu();
                    this.focusElement();
                }
            },

            onDown(event){
                if (this.visible) {
                    event.preventDefault();
                    this.navigateOptions(NEXT);
                }
            },

            onEnter(event){
                if (this.visible) {
                    event.preventDefault();

                    this.findChild((child) => {
                        if (child.isFocus) {
                            child.select();
                        }
                    });
                }
            },

            onEscape(event){
                if (this.visible) {
                    event.preventDefault();
                    this.hideMenu();
                }
            },

            onUp(event){
                if (this.visible) {
                    event.preventDefault();
                    this.navigateOptions(PREV);
                }
            },

            removeTag(index){
                if (this.disabled) {
                    return;
                }

                if (this.remote) {
                    const tag = this.model[index];

                    this.selectedMultiple = this.selectedMultiple.filter(({value}) => value !== tag);
                }

                this.model.splice(index, 1);

                if (this.filterable && this.visible) {
                    this.$refs.input.focus();
                }

                this.broadcast(DROPDOWN_NAME, EVENT_ON_UPDATE_POPPER);
            },

            resetInputState(event){
                if (!this.visible && !IGNORE_KEY_LIST.includes(event.key)) {
                    this.toggleMenu();
                }

                const fontSize = getStyle(this.$refs.input, 'font-size');
                const fontSizeValue = Number.parseInt(fontSize, 10);

                this.inputLength = (this.$refs.input.value.length * fontSizeValue) + INPUT_LENGTH;
            },

            resetScrollTop(){
                if (!this.optionInstances.length) {
                    return;
                }

                const {
                    bottom,
                    top,
                } = this.optionInstances[this.focusIndex - 1].$el.getBoundingClientRect();

                const {
                    bottom: bottomEl,
                    top: topEl,
                } = this.$refs.dropdown.$el.getBoundingClientRect();

                const bottomOverflowDistance = bottom - bottomEl;
                if (bottomOverflowDistance > 0) {
                    this.$refs.dropdown.$el.scrollTop += bottomOverflowDistance;
                }

                const topOverflowDistance = top - topEl;
                if (topOverflowDistance < 0) {
                    this.$refs.dropdown.$el.scrollTop += topOverflowDistance;
                }
            },

            selectionOnDelete(){
                if (this.disabled || this.visible || this.autoComplete) {
                    return;
                }

                if (this.clearable) {
                    this.clearSingleSelect();
                }
            },

            selectionOnTab(event){
                if (this.visible) {
                    event.preventDefault();
                }
            },

            selectionOnUpDown(){
                if (!this.visible) {
                    this.visible = true;
                }
            },

            selectionSetFocus(value){
                if (this.disabled || this.filterable) {
                    return;
                }

                this.focused = !!value;
            },

            setQuery(query){
                if (!this.filterable) {
                    return;
                }

                this.query = query;
            },

            // use when slot changed
            slotChange(){
                this.options = [];
                this.optionInstances = [];
            },

            toggleMenu(){
                if (this.disabled || this.autoComplete) {
                    return;
                }

                if (this.visible && this.multiple) {
                    this.focusElement();
                }

                this.visible = !this.visible;
            },

            // to select option for multiple
            toggleMultipleSelected(init = false){
                if (this.multiple) {
                    const hybridValue = this.model.map(value => ({value}));

                    this.findChild((child) => {
                        const index = this.model.findIndex(value => child.value === value);

                        child.selected = index >= 0;

                        if (child.selected) {
                            hybridValue[index].label = child.label === undefined ? child.$el.innerHTML : child.label;
                        }
                    });

                    if (!init) {
                        const val = this.labelInValue ? hybridValue : this.model;

                        this.$emit(EVENT_ON_CHANGE, val);
                        this.dispatch(FORMITEM_NAME, EVENT_ON_FORM_CHANGE, val);
                    }
                }
            },

            // to select option for single
            toggleSingleSelected(init = false){
                if (!this.multiple) {
                    let foundLabel = EMPTY_STRING;

                    this.findChild((child) => {
                        child.selected = child.value === this.model;

                        if (child.selected) {
                            foundLabel = child.label === undefined ? child.$el.innerHTML : child.label;
                        }
                    });

                    this.hideMenu();

                    if (!init) {
                        const val = this.labelInValue ? {value: this.model, label: foundLabel} : this.model;

                        this.$emit(EVENT_ON_CHANGE, val);
                        this.dispatch(FORMITEM_NAME, EVENT_ON_FORM_CHANGE, val);
                    }
                }
            },

            // 处理 remote 初始值
            updateLabel(){
                if (this.remote) {
                    if (!this.multiple && this.model !== EMPTY_STRING) {
                        this.selectToChangeQuery = true;
                        if (this.currentLabel === EMPTY_STRING) {
                            this.currentLabel = this.model;
                        }

                        this.lastQuery = this.currentLabel;
                        this.query = this.currentLabel;
                    } else if (this.multiple && this.model.length) {
                        if (this.currentLabel.length !== this.model.length) {
                            this.currentLabel = this.model;
                        }

                        this.selectedMultiple = this.model.map((value, index) => ({
                            label: this.currentLabel[index],
                            value,
                        }));
                    } else if (this.multiple && !this.model.length) {
                        this.selectedMultiple = [];
                    }
                }
            },

            updateMultipleSelected(init = false, slot = false){
                if (this.multiple && Array.isArray(this.model)) {
                    const selecteds = this.remote ? this.selectedMultiple : [];

                    this.model.forEach((modelValue) => {
                        this.options.forEach(({label, value}) => {
                            if (value === modelValue) {
                                selecteds.push({label, value});
                            }
                        });
                    });

                    const selectedArray = [];
                    const selectedObject = {};

                    selecteds.forEach((selected) => {
                        if (!selectedObject[selected.value]) {
                            selectedArray.push(selected);
                            selectedObject[selected.value] = 1;
                        }
                    });

                    // #2066
                    if (this.remote) {
                        this.selectedMultiple = this.model.length ? selectedArray : [];
                    } else {
                        this.selectedMultiple = selecteds;
                    }

                    if (slot) {
                        const selectedModel = selecteds.map(({value}) => value);

                        // if slot change and remove a selected option, emit user
                        if (this.model.length === selectedModel.length) {
                            this.slotChangeDuration = true;
                        }

                        this.model = selectedModel;
                    }
                }

                this.toggleMultipleSelected(init);
            },

            updateOptions(slot = false){
                const options = [];
                let index = 1;

                this.findChild((child) => {
                    options.push({
                        value: child.value,
                        label: child.label === undefined ? child.$el.textContent : child.label,
                    });

                    child.index = index;
                    index += 1;

                    this.optionInstances.push(child);
                });

                this.options = options;

                if (!this.remote) {
                    this.updateSingleSelected(true, slot);
                    this.updateMultipleSelected(true, slot);
                }
            },

            updateSingleSelected(init = false, slot = false){
                if (typeof this.model === 'string' || typeof this.model === 'number') {
                    const findModel = this.options.find(({value}) => (value === this.model));

                    if (findModel) {
                        this.selectedSingle = findModel.label;
                    } else if (slot) {
                        this.model = EMPTY_STRING;
                        this.query = EMPTY_STRING;
                    }
                }

                this.toggleSingleSelected(init);
            },
        },
    };
</script>
