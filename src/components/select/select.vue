<template>
    <div
        :class="classes"
        v-click-outside.capture="onClickOutside"
    >
        <div
            :class="selectionCls"
            ref="reference"
            @click="toggleMenu"
            :tabindex="selectTabindex"
            @keydown.esc="handleKeydown"
            @keydown.enter="handleKeydown"
            @keydown.up="handleKeydown"
            @keydown.down="handleKeydown"
            @keydown.left="handleKeydown"
            @keydown.right="handleKeydown"

            @mouseenter="hasMouseHoverHead = true"
            @mouseleave="hasMouseHoverHead = false"

            @blur="toggleHeaderFocus"
            @focus="toggleHeaderFocus"
        >
            <slot name="input">
                <input type="hidden" :name="name" :value="publicValue">
                <select-head
                    :filterable="filterable"
                    :multiple="multiple"
                    :values="values"
                    :clearable="canBeCleared"
                    :disabled="disabled"
                    :remote="remote"
                    :input-element-id="elementId"
                    :initial-label="initialLabel"

                    @on-query-change="onQueryChange"

                    ref="selectHead"
                />
            </slot>
        </div>
        <transition :name="transitionName">
            <Dropdown
                v-show="dropVisible"
                :placement="placement"
                ref="dropdown"
                :data-transfer="transfer"
                v-transfer-dom
            >
                <div class="ivu-select-dropdown" :class="dropdownCls" :style="dropDownStyles">
                    <ul v-show="showNotFoundLabel" :class="[prefixCls + '-not-found']"><li>{{ localeNotFoundText }}</li></ul>
                    <functional-options
                        v-if="(!remote) || (remote && !loading)"
                        :ulClass="[prefixCls + '-dropdown-list']"
                        :options="selectOptions"
                    >
                    </functional-options>
                    <ul v-show="loading" :class="[prefixCls + '-loading']">{{ localeLoadingText }}</ul>
                </div>
            </Dropdown>
        </transition>
    </div>
</template>
<script>
    import Icon from '../icon';
    import Dropdown from '../dropdown/dropdown.vue';
    import vClickOutside from 'v-click-outside-x/index';
    import TransferDom from '../../directives/transfer-dom';
    import { oneOf } from '../../utils/assist';
    import Emitter from '../../mixins/emitter';
    import Locale from '../../mixins/locale';
    import SelectHead from './select-head.vue';
    import FunctionalOptions from './functional-options.vue';

    const prefixCls = 'ivu-select';

    export default {
        name: 'iSelect',
        mixins: [ Emitter, Locale ],
        components: { FunctionalOptions, Dropdown, Icon, SelectHead },
        directives: { clickOutside: vClickOutside.directive, TransferDom },
        props: {
            value: {
                type: [String, Number, Array],
                default: ''
            },
            // 使用时，也得设置 value 才行
            label: {
                type: [String, Number, Array],
                default: ''
            },
            multiple: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            },
            clearable: {
                type: Boolean,
                default: false
            },
            placeholder: {
                type: String
            },
            filterable: {
                type: Boolean,
                default: false
            },
            filterMethod: {
                type: Function
            },
            remoteMethod: {
                type: Function
            },
            loading: {
                type: Boolean,
                default: false
            },
            loadingText: {
                type: String
            },
            size: {
                validator (value) {
                    return oneOf(value, ['small', 'large', 'default']);
                }
            },
            labelInValue: {
                type: Boolean,
                default: false
            },
            notFoundText: {
                type: String
            },
            placement: {
                validator (value) {
                    return oneOf(value, ['top', 'bottom']);
                },
                default: 'bottom'
            },
            transfer: {
                type: Boolean,
                default: false
            },
            // Use for AutoComplete
            autoComplete: {
                type: Boolean,
                default: false
            },
            name: {
                type: String
            },
            elementId: {
                type: String
            }
        },
        mounted(){
            this.$on('on-select-selected', this.onOptionClick);
        },
        data () {
            const {label, multiple, value, $slots} = this;
            let initialValue = Array.isArray(value) ? value : [value];
            if (!multiple && (typeof initialValue[0] === 'undefined' || String(initialValue[0]).trim() === '')) initialValue = [];



            return {
                prefixCls: prefixCls,
                values: initialValue,
                dropDownWidth: 0,
                visible: false,
                focusIndex: -1,
                isFocused: false,
                query: '',
                initialLabel: label,
                hasMouseHoverHead: false,
                slotOptions: $slots.default || [],
                caretPosition: -1,
            };
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-visible`]: this.visible,
                        [`${prefixCls}-disabled`]: this.disabled,
                        [`${prefixCls}-multiple`]: this.multiple,
                        [`${prefixCls}-single`]: !this.multiple,
                        [`${prefixCls}-show-clear`]: this.showCloseIcon,
                        [`${prefixCls}-${this.size}`]: !!this.size
                    }
                ];
            },
            dropdownCls () {
                return {
                    [prefixCls + '-dropdown-transfer']: this.transfer,
                    [prefixCls + '-multiple']: this.multiple && this.transfer,
                    ['ivu-auto-complete']: this.autoComplete,
                };
            },
            selectionCls () {
                return {
                    [`${prefixCls}-selection`]: !this.autoComplete,
                    [`${prefixCls}-selection-focused`]: this.isFocused
                };
            },
            dropDownStyles(){
                const style = {};
                if (this.dropDownWidth) style.width = `${this.dropDownWidth}px`;
                return style;

            },
            localeNotFoundText () {
                if (typeof this.notFoundText === 'undefined') {
                    return this.t('i.select.noMatch');
                } else {
                    return this.notFoundText;
                }
            },
            localeLoadingText () {
                if (typeof this.loadingText === 'undefined') {
                    return this.t('i.select.loading');
                } else {
                    return this.loadingText;
                }
            },
            transitionName () {
                return this.placement === 'bottom' ? 'slide-up' : 'slide-down';
            },
            dropVisible () {
                let status = true;
                const options = this.selectOptions;
                if (!this.loading && this.remote && this.query === '' && !options.length) status = false;

                if (this.autoComplete && !options.length) status = false;

                return this.visible && status;
            },
            showNotFoundLabel () {
                const {loading, remote, selectOptions} = this;
                return selectOptions.length === 0 && (!remote || (remote && !loading));
            },
            publicValue(){
                return this.multiple ? this.values.map(option => option.value) : (this.values[0] || {}).value;
            },
            canBeCleared(){
                const uiStateMatch = this.hasMouseHoverHead || this.active;
                const qualifiesForClear = !this.multiple && this.clearable;
                return uiStateMatch && qualifiesForClear && this.reset; // we return a function
            },
            selectOptions() {
                const selectOptions = [];
                let optionCounter = -1;
                const currentIndex = this.focusIndex;
                const selectedValues = this.values.map(({value}) => value);
                for (let option of this.slotOptions) {

                    if (!option.componentOptions) continue;

                    if (option.componentOptions.tag === 'option-group'){
                        let children = option.componentOptions.children;

                        // remove filtered children
                        if (this.filterable){
                            children = children.filter(
                                ({componentOptions}) => this.validateOption(componentOptions)
                            );
                        }

                        option.componentOptions.children = children.map(opt => {
                            optionCounter = optionCounter + 1;
                            return this.processOption(opt, selectedValues, optionCounter === currentIndex);
                        });

                        // keep the group if it still has children
                        if (option.componentOptions.children.length > 0) selectOptions.push({...option});
                    } else {
                        // ignore option if not passing filter
                        const optionPassesFilter = this.filterable ? this.validateOption(option.componentOptions) : option;
                        if (!optionPassesFilter) continue;

                        optionCounter = optionCounter + 1;
                        selectOptions.push(this.processOption(option, selectedValues, optionCounter === currentIndex));
                    }
                }

                return selectOptions;
            },
            flatOptions(){
                return this.selectOptions.reduce((options, option) => {
                    const isOptionGroup = option.componentOptions.tag === 'option-group';
                    if (isOptionGroup) return options.concat(option.componentOptions.children || []);
                    else return options.concat(option);
                }, []);
            },
            selectTabindex(){
                return this.disabled || this.filterable ? -1 : 0;
            },
            remote(){
                return typeof this.remoteMethod === 'function';
            }
        },
        methods: {
            processOption(option, values, isFocused){
                if (!option.componentOptions) return option;
                const optionValue = option.componentOptions.propsData.value;
                const isSelected = values.includes(optionValue);

                const propsData = {
                    ...option.componentOptions.propsData,
                    selected: isSelected,
                    isFocused: isFocused,
                };

                return {
                    ...option,
                    componentOptions: {
                        ...option.componentOptions,
                        propsData: propsData
                    }
                };
            },

            validateOption({elm, propsData}){
                const value = propsData.value;
                const label = propsData.label || '';
                const textContent = elm && elm.textContent || '';
                const stringValues = JSON.stringify([value, label, textContent]);
                return stringValues.toLowerCase().includes(this.query);
            },

            toggleMenu (e, force) {
                if (this.disabled || this.autoComplete) {
                    return false;
                }
                this.focusIndex = -1;

                this.visible = typeof force !== 'undefined' ? force : !this.visible;
                if (this.visible){
                    this.dropDownWidth = this.$el.getBoundingClientRect().width;
                }
            },
            hideMenu () {
                this.toggleMenu(null, false);
            },
            onClickOutside(event){
                if (this.visible) {

                    if (this.filterable) {
                        const input = this.$refs.selectHead.$refs.input;
                        this.caretPosition = input.selectionStart;
                        this.$nextTick(() => {
                            const caretPosition = this.caretPosition === -1 ? input.value.length : this.caretPosition;
                            input.setSelectionRange(caretPosition, caretPosition);
                        });
                    }

                    event.stopPropagation();
                    event.preventDefault();
                    this.hideMenu();
                    this.isFocused = true;
                } else {
                    this.caretPosition = -1;
                    this.isFocused = false;
                }
            },
            reset(){
                this.values = [];
            },
            handleKeydown (e) {
                if (this.visible) {
                    e.preventDefault();

                    // Esc slide-up
                    if (e.key === 'Escape') {
                        this.hideMenu();
                    }
                    // next
                    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                        this.navigateOptions(-1);
                    }
                    // prev
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                        this.navigateOptions(1);
                    }
                    // enter
                    if (e.key === 'Enter') {
                        const focusedOption = this.flatOptions[this.focusIndex];
                        if (focusedOption){
                            focusedOption.componentInstance.select();
                        }
                    }
                } else {
                    if (e.key !== 'Escape') this.toggleMenu();
                }


            },
            navigateOptions(direction){
                const optionsLength = this.flatOptions.length - 1;

                let index = this.focusIndex + direction;
                if (index < 0) index = optionsLength;
                if (index > optionsLength) index = 0;

                // find nearest option in case of disabled options in between
                if (direction > 0){
                    let nearestActiveOption = -1;
                    for (let i = 0; i < this.flatOptions.length; i++){
                        const optionIsActive = !this.flatOptions[i].componentInstance.disabled;
                        if (optionIsActive) nearestActiveOption = i;
                        if (nearestActiveOption >= index) break;
                    }
                    index = nearestActiveOption;
                } else {
                    let nearestActiveOption = this.flatOptions.length;
                    for (let i = optionsLength; i >= 0; i--){
                        const optionIsActive = !this.flatOptions[i].componentInstance.disabled;
                        if (optionIsActive) nearestActiveOption = i;
                        if (nearestActiveOption <= index) break;
                    }
                    index = nearestActiveOption;
                }

                this.focusIndex = index;
            },
            onOptionClick(option) {
                if (this.multiple){
                    const valueIsSelected = this.values.find(({value}) => value === option.value);
                    if (valueIsSelected){
                        this.values = this.values.filter(({value}) => value !== option.value);
                    } else {
                        this.values = this.values.concat(option);
                    }

                    // reset query
                    if (this.filterable){
                        const inputField = this.$refs.selectHead.$refs.input;
                        this.$nextTick(() => inputField.value = '');
                    }
                } else {
                    this.values = [option];
                    this.hideMenu();
                }
            },
            onQueryChange(query) {
                this.query = query.toLowerCase().trim();
                if (this.query.length > 0) this.visible = true;
            },
            toggleHeaderFocus({target, type}){
                if (this.disabled) {
                    return;
                }
                this.isFocused = type === 'focus';
            },

        },
        watch: {
            values(now, before){
                const newValue = JSON.stringify(now);
                const oldValue = JSON.stringify(before);
                const shouldEmitInput = newValue !== oldValue;
                if (shouldEmitInput) this.$emit('input', this.publicValue); // to update v-model
            },
            query (query) {
                this.$emit('on-query-change', query);
                if (this.remote && this.remoteMethod){
                    this.focusIndex = -1;
                    const promise = this.remoteMethod(query);
                    this.initialLabel = '';
                    if (promise && promise.then){
                        promise.then(options => {
                            if (options) this.options = options;
                        });
                    }
                }
            },
            loading(state){
                if (state === false){
                    this.slotOptions = this.$slots.default || [];
                }
            },
            isFocused(){
                const {selectHead, reference} = this.$refs;
                const el = this.filterable ? selectHead.$el.querySelector('input') : reference;
                el[this.isFocused ? 'focus' : 'blur']();
            }
        }
    };
</script>
