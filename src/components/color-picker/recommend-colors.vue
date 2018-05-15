<template>
    <div
        ref="reference"
        :tabindex="tabbable ? 1 : 0"
        @click="handleClick"
        @keydown.esc="handleEscape"
        @keydown.enter="handleEnter"
        @keydown.left="handleArrow($event, 'x', left)"
        @keydown.right="handleArrow($event, 'x', right)"
        @keydown.up="handleArrow($event, 'y', up)"
        @keydown.down="handleArrow($event, 'y', down)"
        @blur="blurColor"
        @focus="focusColor"
    >
        <template v-for="(item, index) in list">
            <div
                :key="item"
                class="ivu-color-picker-picker-colors-wrapper">
                <div :data-color-id="index">
                    <div
                        :style="{background: item}"
                        class="ivu-color-picker-picker-colors-wrapper-color"
                    ></div>
                    <div
                        :ref="'color-circle-' + index"
                        class="ivu-color-picker-picker-colors-wrapper-circle ivu-color-picker-hide"></div>
                </div>
            </div>
            <br v-if="lineBreak(list, index)">
        </template>
    </div>
</template>

<script>
import Emitter from '../../mixins/emitter';
import {clamp} from './utils';

export default {
    name: 'RecommendedColors',

    mixins: [Emitter],

    props: {
        list: {
            type: Array,
            default: undefined,
        },
        tabbable: {
            type: Boolean,
            required: true,
        },
    },

    data() {
        const columns = 12;
        const rows = Math.ceil(this.list.length / columns);
        const normalStep = 1;

        return {
            left: -normalStep,
            right: normalStep,
            up: -normalStep,
            down: normalStep,
            powerKey: 'shiftKey',
            grid: {x: 1, y: 1},
            rows,
            columns,
        };
    },

    computed: {
        linearIndex() {
            return this.columns * (this.grid.y - 1) + this.grid.x - 1;
        },
        currentCircle() {
            return this.$refs[`color-circle-${this.linearIndex}`][0];
        },
    },

    methods: {
        handleArrow(e, axis, direction) {
            e.preventDefault();
            e.stopPropagation();

            this.blurColor();

            if (e[this.powerKey]) {
                if (direction < 0) {
                    this.grid[axis] = 1;
                } else {
                    this.grid[axis] = axis === 'x' ? this.columns : this.rows;
                }
            } else {
                this.grid[axis] += direction;
            }

            this.focusColor();
        },
        blurColor() {
            this.currentCircle.classList.add('ivu-color-picker-hide');
        },
        boundsColor(axis, limit) {
            this.grid[axis] = clamp(this.grid[axis], 1, limit);
        },
        focusColor() {
            this.boundsColor('x', this.columns);
            this.boundsColor('y', this.rows);
            this.currentCircle.classList.remove('ivu-color-picker-hide');
        },
        handleEnter(e) {
            this.handleClick(e, this.currentCircle);
        },
        handleClick(e, circle) {
            e.preventDefault();
            e.stopPropagation();

            this.$refs.reference.focus();

            const target = circle || e.target;
            const colorId = target.dataset.colorId || target.parentElement.dataset.colorId;

            if (colorId) {
                this.blurColor();
                const id = Number(colorId) + 1;
                this.grid.x = id % this.columns || this.columns;
                this.grid.y = Math.ceil(id / this.columns);
                this.focusColor();
                this.$emit('picker-color', this.list[colorId]);
            }
        },
        handleEscape(e) {
            this.dispatch('ColorPicker', 'on-escape-keydown', e);
        },
        lineBreak(list, index) {
            if (!index) {
                return false;
            }

            const nextIndex = index + 1;

            return nextIndex < list.length && nextIndex % this.columns === 0;
        },
    },
};
</script>
