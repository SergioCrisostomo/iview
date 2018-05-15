<template>
    <div
        v-click-outside.capture="handleClose"
        v-click-outside:mousedown.capture="handleClose"
        :class="classes">
        <div
            ref="reference"
            :class="wrapClasses"
            @click="toggleVisible">
            <input
                :name="name"
                :value="currentValue"
                type="hidden">
            <i class="ivu-icon ivu-icon-arrow-down-b ivu-input-icon ivu-input-icon-normal"></i>
            <div
                ref="input"
                :tabindex="disabled ? 0 : 1"
                :class="inputClasses"
                @keydown.tab="onTab"
                @keydown.esc="onEscape"
                @keydown.up="onArrow"
                @keydown.down="onArrow"
            >
                <div :class="[prefixCls + '-color']">
                    <div
                        v-show="value === '' && !visible"
                        :class="[prefixCls + '-color-empty']">
                        <i class="ivu-icon ivu-icon-ios-close-empty"></i>
                    </div>
                    <div
                        v-show="value || visible"
                        :style="displayedColorStyle"></div>
                </div>
            </div>
        </div>
        <transition name="transition-drop">
            <Drop
                v-transfer-dom
                v-show="isVisible"
                ref="drop"
                :class="{ [prefixCls + '-transfer']: transfer }"
                :placement="placement"
                :data-transfer="transfer"
                class="ivu-transfer-no-max-height"
            >
                <div :class="[prefixCls + '-picker']">
                    <div :class="[prefixCls + '-picker-wrapper']">
                        <div :class="[prefixCls + '-picker-panel']">
                            <Saturation
                                ref="saturation"
                                v-model="saturationColors"
                                :tabbable="isVisible"
                                :visible="visible"
                                @change="childChange"
                                @keydown.native.tab="handleFirstTab"
                            ></Saturation>
                        </div>
                        <div
                            v-if="hue"
                            :class="[prefixCls + '-picker-hue-slider']">
                            <Hue
                                v-model="saturationColors"
                                :tabbable="isVisible"
                                @change="childChange"></Hue>
                        </div>
                        <div
                            v-if="alpha"
                            :class="[prefixCls + '-picker-alpha-slider']">
                            <Alpha
                                v-model="saturationColors"
                                :tabbable="isVisible"
                                @change="childChange"></Alpha>
                        </div>
                        <recommend-colors
                            v-if="colors.length"
                            :tabbable="isVisible"
                            :list="colors"
                            :class="[prefixCls + '-picker-colors']"
                            @picker-color="handleSelectColor"></recommend-colors>
                        <recommend-colors
                            v-if="!colors.length && recommend"
                            :tabbable="isVisible"
                            :list="recommendedColor"
                            :class="[prefixCls + '-picker-colors']"
                            @picker-color="handleSelectColor"></recommend-colors>
                    </div>
                    <div :class="[prefixCls + '-confirm']">
                        <span :class="[prefixCls + '-confirm-color']">{{formatColor}}</span>
                        <i-button
                            ref="clear"
                            :tabindex="tabindex"
                            size="small"
                            type="ghost"
                            @click.native="handleClear"
                            @keydown.enter="handleClear"
                            @keydown.native.esc="closer"
                        >{{t('i.datepicker.clear')}}</i-button>
                        <i-button
                            ref="ok"
                            :tabindex="tabindex"
                            size="small"
                            type="primary"
                            @click.native="handleSuccess"
                            @keydown.native.tab="handleLastTab"
                            @keydown.enter="handleSuccess"
                            @keydown.native.esc="closer"
                        >{{t('i.datepicker.ok')}}</i-button>
                    </div>
                </div>
            </Drop>
        </transition>
    </div>
</template>

<script>
import tinycolor from 'tinycolor2';
import vClickOutside from 'v-click-outside-x/index';
import TransferDom from '../../directives/transfer-dom';
import Drop from '../../components/select/dropdown.vue';
import RecommendColors from './recommend-colors.vue';
import Saturation from './saturation.vue';
import Hue from './hue.vue';
import Alpha from './alpha.vue';
import Locale from '../../mixins/locale';
import {oneOf} from '../../utils/assist';
import Emitter from '../../mixins/emitter';
import {changeColor, toRGBAString} from './utils';

const prefixCls = 'ivu-color-picker';
const inputPrefixCls = 'ivu-input';

export default {
    name: 'ColorPicker',

    components: {Drop, RecommendColors, Saturation, Hue, Alpha},

    directives: {clickOutside: vClickOutside.directive, TransferDom},

    mixins: [Emitter, Locale],

    props: {
        value: {
            type: String,
            default: undefined,
        },
        hue: {
            type: Boolean,
            default: true,
        },
        alpha: {
            type: Boolean,
            default: false,
        },
        recommend: {
            type: Boolean,
            default: false,
        },
        format: {
            type: String,
            validator(value) {
                return oneOf(value, ['hsl', 'hsv', 'hex', 'rgb']);
            },
            default: undefined,
        },
        colors: {
            type: Array,
            default() {
                return [];
            },
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        size: {
            type: String,
            validator(value) {
                return oneOf(value, ['small', 'large', 'default']);
            },
            default: 'default',
        },
        show: {
            type: Boolean,
            default: true,
        },
        placement: {
            type: String,
            validator(value) {
                return oneOf(value, [
                    'top',
                    'top-start',
                    'top-end',
                    'bottom',
                    'bottom-start',
                    'bottom-end',
                    'left',
                    'left-start',
                    'left-end',
                    'right',
                    'right-start',
                    'right-end',
                ]);
            },
            default: 'bottom',
        },
        transfer: {
            type: Boolean,
            default: false,
        },
        name: {
            type: String,
            default: undefined,
        },
    },

    data() {
        return {
            val: changeColor(this.value),
            currentValue: this.value,
            prefixCls,
            visible: false,
            recommendedColor: [
                '#2d8cf0',
                '#19be6b',
                '#ff9900',
                '#ed3f14',
                '#00b5ff',
                '#19c919',
                '#f9e31c',
                '#ea1a1a',
                '#9b1dea',
                '#00c2b1',
                '#ac7a33',
                '#1d35ea',
                '#8bc34a',
                '#f16b62',
                '#ea4ca3',
                '#0d94aa',
                '#febd79',
                '#5d4037',
                '#00bcd4',
                '#f06292',
                '#cddc39',
                '#607d8b',
                '#000000',
                '#ffffff',
            ],
        };
    },

    computed: {
        tabindex() {
            return this.isVisible ? 1 : 0;
        },
        isVisible() {
            return this.show && this.visible;
        },
        transition() {
            return oneOf(this.placement, ['bottom-start', 'bottom', 'bottom-end']) ? 'slide-up' : 'fade';
        },
        saturationColors: {
            get() {
                return this.val;
            },
            set(newVal) {
                this.val = newVal;
                this.$emit('on-active-change', this.formatColor);
            },
        },
        classes() {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-transfer`]: this.transfer,
                },
            ];
        },
        wrapClasses() {
            return [
                `${prefixCls}-rel`,
                `${prefixCls}-${this.size}`,
                `${inputPrefixCls}-wrapper`,
                `${inputPrefixCls}-wrapper-${this.size}`,
            ];
        },
        inputClasses() {
            return [
                `${prefixCls}-input`,
                `${inputPrefixCls}`,
                `${inputPrefixCls}-${this.size}`,
                {
                    [`${prefixCls}-focused`]: this.visible,
                    [`${inputPrefixCls}-disabled`]: this.disabled,
                },
            ];
        },
        displayedColorStyle() {
            return {backgroundColor: toRGBAString(this.visible ? this.saturationColors.rgba : tinycolor(this.value).toRgb())};
        },
        formatColor() {
            const {format, saturationColors: value} = this;

            if (format) {
                if (format === 'hsl') {
                    return tinycolor(value.hsl).toHslString();
                }

                if (format === 'hsv') {
                    return tinycolor(value.hsv).toHsvString();
                }

                if (format === 'hex') {
                    return value.hex;
                }

                if (format === 'rgb') {
                    return toRGBAString(value.rgba);
                }
            } else if (this.alpha) {
                return toRGBAString(value.rgba);
            }

            return value.hex;
        },
    },

    watch: {
        value(newVal) {
            this.val = changeColor(newVal);
        },
        visible(val) {
            this.val = changeColor(this.value);
            this.$refs.drop[val ? 'update' : 'destroy']();
            this.$emit('on-open-change', Boolean(val));
        },
    },

    mounted() {
        this.$on('on-escape-keydown', this.closer);
    },

    methods: {
        handleClose(event) {
            if (this.visible) {
                if (event.type === 'mousedown') {
                    event.preventDefault();
                    return;
                }

                if (this.transfer) {
                    const {$el} = this.$refs.drop;
                    if ($el === event.target || $el.contains(event.target)) {
                        return;
                    }
                }

                this.closer(event);
                return;
            }

            this.visible = false;
        },
        toggleVisible() {
            this.visible = !this.visible;
            this.$refs.input.focus();
        },
        childChange(data) {
            this.colorChange(data);
        },
        colorChange(data, oldHue) {
            this.oldHue = this.saturationColors.hsl.h;
            this.saturationColors = changeColor(data, oldHue || this.oldHue);
        },
        closer(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            this.visible = false;
            this.$refs.input.focus();
        },
        handleButtons(event, value) {
            this.currentValue = value;
            this.$emit('input', value);
            this.$emit('on-change', value);
            this.dispatch('FormItem', 'on-form-change', value);
            this.closer(event);
        },
        handleSuccess(event) {
            this.handleButtons(event, this.formatColor);
            this.$emit('on-pick-success');
        },
        handleClear(event) {
            this.handleButtons(event, '');
            this.$emit('on-pick-clear');
        },
        handleSelectColor(color) {
            this.val = changeColor(color);
        },
        handleFirstTab(event) {
            if (event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();
                this.$refs.ok.$el.focus();
            }
        },
        handleLastTab(event) {
            if (!event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();
                this.$refs.saturation.$el.focus();
            }
        },
        onTab(event) {
            if (this.visible) {
                event.preventDefault();
            }
        },
        onEscape(event) {
            if (this.visible) {
                this.closer(event);
            }
        },
        onArrow(event) {
            if (!this.visible) {
                event.preventDefault();
                event.stopPropagation();
                this.visible = true;
            }
        },
    },
};
</script>
