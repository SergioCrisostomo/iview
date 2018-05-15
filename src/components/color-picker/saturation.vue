<template>
    <div
        :tabindex="tabindex"
        class="ivu-color-picker-saturation-wrapper"
        @keydown.esc="handleEscape"
        @click="$el.focus()"
        @keydown.left="handleLeft"
        @keydown.right="handleRight"
        @keydown.up="handleUp"
        @keydown.down="handleDown"
    >
        <div
            ref="container"
            :style="bgColorStyle"
            class="ivu-color-picker-saturation"
            @mousedown="handleMouseDown">
            <div class="ivu-color-picker-saturation--white"></div>
            <div class="ivu-color-picker-saturation--black"></div>
            <div
                :style="pointerStyle"
                class="ivu-color-picker-saturation-pointer">
                <div class="ivu-color-picker-saturation-circle"></div>
            </div>
        </div>
    </div>
</template>

<script>
import common from './mixin';
import {clamp, getIncrement} from './utils';

export default {
    name: 'Saturation',

    mixins: [common],

    props: {
        // more props in the mixin
        visible: {
            type: Boolean,
            required: true,
        },
    },

    data() {
        const normalStep = 0.01;

        return {
            left: -normalStep,
            right: normalStep,
            up: normalStep,
            down: -normalStep,
            multiplier: 10,
            powerKey: 'shiftKey',
        };
    },

    computed: {
        bgColorStyle() {
            return {background: `hsl(${this.value.hsv.h}, 100%, 50%)`};
        },
        pointerStyle() {
            return {top: `${-(this.value.hsv.v * 100) + 1 + 100}%`, left: `${this.value.hsv.s * 100}%`};
        },
    },

    watch: {
        visible(val) {
            if (val) {
                this.$el.focus();
            }
        },
    },

    methods: {
        change(h, s, v, a) {
            this.$emit('change', {h, s, v, a, source: 'hsva'});
        },
        handleSlide(e, direction, key) {
            e.preventDefault();
            e.stopPropagation();

            const isPowerKey = e[this.powerKey];
            const increment = isPowerKey ? direction * this.multiplier : direction;
            const {h, s, v, a} = this.value.hsv;
            const saturation = clamp(s + getIncrement(key, ['left', 'right'], increment), 0, 1);
            const bright = clamp(v + getIncrement(key, ['up', 'down'], increment), 0, 1);

            this.change(h, saturation, bright, a);
        },
        handleChange(e) {
            e.preventDefault();
            e.stopPropagation();

            const {clientWidth, clientHeight} = this.$refs.container;
            const left = clamp(this.handleGetLeft(e), 0, clientWidth);
            const top = clamp(this.handleGetTop(e), 0, clientHeight);
            const saturation = left / clientWidth;
            const bright = clamp(1 - top / clientHeight, 0, 1);

            this.change(this.value.hsv.h, saturation, bright, this.value.hsv.a);
        },
        handleMouseDown(e) {
            common.methods.handleMouseDown.call(this, e);
            window.addEventListener('mouseup', this.handleChange, false);
        },
        unbindEventListeners(e) {
            common.methods.unbindEventListeners.call(this, e);
            window.removeEventListener('mouseup', this.handleChange);
        },
    },
};
</script>
