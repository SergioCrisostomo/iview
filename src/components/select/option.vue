<template>
    <li
        v-show="!hidden"
        :class="optionClasses"
        @click.stop="select"
        @mouseout.stop="blur"
    >
        <slot>{{showLabel}}</slot>
    </li>
</template>

<script>
    import regexpEscape from 'regexp.escape';
    import SELECT_NAME from './selectName';
    import OPTION_NAME from './optionName';
    import PREFIXCLS from './prefixCls';
    import Emitter from '@/mixins/emitter';
    import {
        APPEND,
        DISABLED,
        EMPTY_STRING,
        FOCUS,
        ITEM,
        REMOVE,
        SELECTED,
    } from '@/utils/constants';
    import {
        STRING_NUMBER_LIST,
    } from '@/utils/enums';
    import {
        findComponentUpward,
        kebabJoin,
    } from '@/utils/assist';
    import {
        EVENT_ON_QUERY_CHANGE,
        EVENT_ON_SELECT_CLOSE,
        EVENT_ON_SELECT_SELECTED,
    } from '@/utils/eventNames';

    const prefixCls = kebabJoin(PREFIXCLS, ITEM);

    export default {
        name: OPTION_NAME,

        mixins: [Emitter],

        props: {
            disabled: {
                default: false,
                type: Boolean,
            },
            label: {
                default: undefined,
                type: STRING_NUMBER_LIST,
            },
            value: {
                required: true,
                type: STRING_NUMBER_LIST,
            },
        },

        data(){
            return {
                autoComplete: false,
                hidden: false, // for search
                index: 0, // for up and down to focus
                isFocus: false,
                searchLabel: EMPTY_STRING, // the value is slot,only for search
                selected: false,
            };
        },

        computed: {
            optionClasses(){
                return [
                    prefixCls,
                    {
                        [kebabJoin(prefixCls, DISABLED)]: this.disabled,
                        [kebabJoin(prefixCls, FOCUS)]: this.isFocus,
                        [kebabJoin(prefixCls, SELECTED)]: this.selected && !this.autoComplete,
                    },
                ];
            },

            showLabel(){
                return this.label || this.value;
            },
        },

        mounted(){
            this.updateSearchLabel();
            this.dispatch(SELECT_NAME, APPEND);
            this.$on(EVENT_ON_SELECT_CLOSE, this.onSelectClose);
            this.$on(EVENT_ON_QUERY_CHANGE, this.onQueryChange);

            const Select = findComponentUpward(this, SELECT_NAME);

            if (Select) {
                this.autoComplete = Select.autoComplete;
            }
        },

        beforeDestroy(){
            this.dispatch(SELECT_NAME, REMOVE);
            this.$off(EVENT_ON_SELECT_CLOSE, this.onSelectClose);
            this.$off(EVENT_ON_QUERY_CHANGE, this.onQueryChange);
        },

        methods: {
            blur(){
                this.isFocus = false;
            },

            onQueryChange(val){
                this.queryChange(val);
            },

            onSelectClose(){
                this.isFocus = false;
            },

            queryChange(val){
                const parsedQuery = regexpEscape(val);
                const rx = new RegExp(parsedQuery, 'i');

                this.hidden = !rx.test(this.searchLabel);
            },

            select(){
                if (this.disabled) {
                    return;
                }

                this.dispatch(SELECT_NAME, EVENT_ON_SELECT_SELECTED, this.value);
            },

            // 在使用函数防抖后，设置 key 后，不更新组件了，导致SearchLabel 不更新 #1865
            updateSearchLabel(){
                this.searchLabel = this.$el.textContent;
            },

        },
    };
</script>
