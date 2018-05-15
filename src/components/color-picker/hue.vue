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
            pullDirection: '',
        };
    },

    computed: {
        pointerStyle() {
            const {h} = this.value.hsl;

            return {
                top: 0,
                left: h === 0 && this.pullDirection === 'right' ? '100%' : `${h * 100 / 360}%`,
            };
        },
    },

    watch: {
        value(value) {
            const {h} = value.hsl;

            if (h !== 0) {
                const diff = h - this.oldHue;

                if (diff !== 0) {
                    this.pullDirection = diff > 0 ? 'right' : 'left';
                }
            }

            this.oldHue = h;
        },
    },

    methods: {
        change(newHue) {
            const {h, s, l, a} = this.value.hsl;

            if (h !== newHue) {
                this.$emit('change', {h: newHue, s, l, a, source: 'hsl'});
            }
        },
        handleSlide(e, direction) {
            e.preventDefault();
            e.stopPropagation();

            if (e[this.powerKey]) {
                this.change(direction <= 0 ? 0 : 360);
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
