<template>
    <div
        tabindex="0"
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
                :style="{top: 0, left: `${percent}%`}"
                class="ivu-color-picker-hue-pointer">
                <div class="ivu-color-picker-hue-picker"></div>
            </div>
        </div>
    </div>
</template>

<script>
import hsaMixin from './hsaMixin';
import {clamp} from './utils';

export default {
    name: 'Hue',

    mixins: [hsaMixin],

    props: {
        // more props in the mixin
    },

    data() {
        const normalStep = 1 / 360 * 25;
        const jumpStep = 20 * normalStep;

        return {
            left: -normalStep,
            right: normalStep,
            up: jumpStep,
            down: -jumpStep,
            powerKey: 'shiftKey',
            percent: clamp(this.value.hsl.h * 100 / 360, 0, 100),
        };
    },

    watch: {},

    methods: {
        change(percent) {
            this.percent = clamp(percent, 0, 100);

            const {h, s, l, a} = this.value.hsl;
            const newHue = clamp(percent / 100 * 360, 0, 360);

            if (h !== newHue) {
                this.$emit('change', {h: newHue, s, l, a, source: 'hsl'});
            }
        },
        handleSlide(e, direction) {
            e.preventDefault();
            e.stopPropagation();

            if (e[this.powerKey]) {
                this.change(direction < 0 ? 0 : 100);
                return;
            }

            this.change(this.percent + direction);
        },
        handleChange(e) {
            e.preventDefault();
            e.stopPropagation();

            const left = this.getLeft(e);

            if (left < 0) {
                this.change(0);
                return;
            }

            const {clientWidth} = this.$refs.container;

            if (left > clientWidth) {
                this.change(100);
                return;
            }

            this.change(left * 100 / clientWidth);
        },
    },
};
</script>
