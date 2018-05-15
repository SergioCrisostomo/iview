<template>
    <div
        ref="reference"
        :tabindex="tabbable ? 1 : 0"
        @click="handleClick"
        @keydown.esc="handleEscape"
        @keydown.enter="handleEnter"
        @keydown.left="handleLeft"
        @keydown.right="handleRight"
        @keydown.up="handleUp"
        @keydown.down="handleDown"
        @blur="blurColor"
        @focus="focusColor"
    >
        <template v-for="(item, index) in list">
            <div class="ivu-color-picker-picker-colors-wrapper">
                <div :data-color-id="index">
                    <div
                        :style="{background: item}"
                        class="ivu-color-picker-picker-colors-wrapper-color"
                    ></div>
                    <div :ref="'color-circle-' + index"></div>
                </div>
            </div>
            <br v-if="(index + 1) % columns === 0 && index !== 0 && (index + 1) !== list.length">
        </template>
    </div>
</template>
<script>
    import Emitter from '../../mixins/emitter';

    const focusedClass = 'ivu-color-picker-picker-colors-wrapper-circle';

    export default {
        mixins: [Emitter],
        props: {
            list: Array,
            tabbable: {
                type: Boolean,
                required: true,
            },
        },
        data() {
            const columns = 12;
            const rows = Math.ceil(this.list.length / columns);

            return {
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
            handleLeft() {
                this.blurColor();
                this.grid.x -= 1;
                this.focusColor();
            },
            handleRight() {
                this.blurColor();
                this.grid.x += 1;
                this.focusColor();
            },
            handleUp() {
                this.blurColor();
                this.grid.y -= 1;
                this.focusColor();
            },
            handleDown() {
                this.blurColor();
                this.grid.y += 1;
                this.focusColor();
            },
            blurColor() {
                this.currentCircle.classList.remove(focusedClass);
            },
            focusColor() {
                if (this.grid.x < 1) {
                    this.grid.x = 1;
                } else if (this.grid.x >= this.columns) {
                    this.grid.x = this.columns;
                }

                if (this.grid.y < 1) {
                    this.grid.y = 1;
                } else if (this.grid.y >= this.rows) {
                    this.grid.y = this.rows;
                }

                this.currentCircle.classList.add(focusedClass);
            },
            handleEnter() {
                this.handleClick({target: this.currentCircle});
            },
            handleClick(e) {
                this.$refs.reference.focus();
                const colorId = e.target.dataset.colorId || e.target.parentElement.dataset.colorId;
                if (colorId) {
                    this.blurColor();
                    const id = Number(colorId) + 1;
                    this.grid.x = id % this.columns || this.columns;
                    this.grid.y = Math.ceil(id / this.columns);
                    this.focusColor();
                    this.$emit('picker-color', this.list[colorId]);
                }
            },
            handleEscape() {
                this.dispatch('ColorPicker', 'on-escape-keydown');
            },
        },
    };
</script>
