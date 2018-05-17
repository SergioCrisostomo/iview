<template>
    <div
        :tabindex="tabindex"
        class="ivu-color-picker-hue"
        @click="$el.focus()"
        @keydown.esc="handleEscape"
        @keydown.left="handleLeft"
        @keydown.right="handleRight"
        @keydown.up="handleUp"
        @keydown.down="handleDown"
    >
        <div
            ref="container"
            class="ivu-color-picker-hue-container"
            @mousedown="handleMouseDown"
            @touchmove="handleChange"
            @touchstart="handleChange">
            <div
                :style="pointerStyle"
                class="ivu-color-picker-hue-pointer">
                <div class="ivu-color-picker-hue-picker"></div>
            </div>
        </div>
    </div>
</template>

<script>
import common from './mixin';
import {clamp} from './utils';

export default {
    name: 'Hue',

    mixins: [common],

    props: {
        // more props in the mixin
    },

    data() {
        const normalStep = 1;
        const jumpStep = 36;

        return {
            left: -normalStep,
            right: normalStep,
            up: jumpStep,
            down: -jumpStep,
            powerKey: 'shiftKey',
            oldHue: 0,
            displayHue: this.value.hsl.h,
            lastDirection: 0,
        };
    },

    computed: {
        pointerStyle() {
            return {
                top: 0,
                left: `${this.displayHue * 100 / 360}%`,
            };
        },
    },

    watch: {
        value(value) {
            const {h} = value.hsl;
            const edge = Math.round(this.oldHue / 360);
            this.displayHue = h % 360 === 0 ? (edge === 1 ? 360 : 0) : h;
            this.oldHue = this.displayHue;
        },
    },

    methods: {
        change(newHue) {
            this.$emit('change', {
                ...this.value.hsl,
                h: newHue,
                source: 'hsl'
            });
        },
        handleSlide(e, direction) {
            e.preventDefault();
            e.stopPropagation();

            if (e[this.powerKey]) {
                this.lastDirection = direction;
                const value = direction === 1 ? 360 : 0;
                this.oldHue = value; // force update
                this.change(value);
                return;
            }

            this.change(clamp(this.value.hsl.h + direction, 0, 360));
        },
        handleChange(e) {
            e.preventDefault();
            e.stopPropagation();

            const left = this.handleGetLeft(e);

            if (left < 0) {
                this.change(0);
                return;
            }

            const {clientWidth} = this.$refs.container;

            if (left > clientWidth) {
                this.change(360);
                return;
            }

            this.change(360 * Math.round(left * 100 / clientWidth) / 100);
        },
    },
};
</script>
