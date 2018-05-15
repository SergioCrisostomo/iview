<template>
    <div
        :tabindex="tabbable ? 1 : 0"
        class="ivu-color-picker-alpha"
        @keydown.esc="handleEscape"
        @keydown.left="handleLeft"
        @keydown.right="handleRight"
        @keyup="handleSlide"
    >
        <div class="ivu-color-picker-alpha-checkboard-wrap">
            <div class="ivu-color-picker-alpha-checkerboard"></div>
        </div>
        <div
            :style="{background: gradientColor}"
            class="ivu-color-picker-alpha-gradient"></div>
        <div
            ref="container"
            class="ivu-color-picker-alpha-container"
            @mousedown="handleMouseDown"
            @touchmove="handleChange"
            @touchstart="handleChange">
            <div
                :style="{left: colors.a * 100 + '%'}"
                class="ivu-color-picker-alpha-pointer">
                <div class="ivu-color-picker-alpha-picker"></div>
            </div>
        </div>
    </div>
</template>
<script>
    import Emitter from '../../mixins/emitter';

    export default {
        name: 'Alpha',
        mixins: [Emitter],
        props: {
            tabbable: {
                type: Boolean,
                required: true,
            },
            value: Object,
            onChange: Function,
        },
        computed: {
            colors() {
                return this.value;
            },
            gradientColor() {
                const rgba = this.colors.rgba;
                const rgbStr = [rgba.r, rgba.g, rgba.b].join(',');
                return `linear-gradient(to right, rgba(${rgbStr}, 0) 0%, rgba(${rgbStr}, 1) 100%)`;
            },
        },
        methods: {
            handleLeft(e) {
                this.handleSlide(e, -1);
            },
            handleRight(e) {
                this.handleSlide(e, 1);
            },
            handleSlide(e, direction) {
                if (!direction) {
                    return;
                }

                e.preventDefault();
                const increment = direction * (e.altKey ? 10 : 1);
                let a = this.colors.a * 100 + increment;
                if (a < 0 || (e.metaKey && direction < 0)) {
                    a = 0;
                } else if (a > 100 || (e.metaKey && direction > 0)) {
                    a = 100;
                }

                a = Number((a / 100).toFixed(2));

                if (this.colors.a !== a) {
                    this.$emit('change', {
                        h: this.colors.hsl.h,
                        s: this.colors.hsl.s,
                        l: this.colors.hsl.l,
                        a,
                        source: 'rgba',
                    });
                }
            },
            handleChange(e, skip) {
                if (!skip) {
                    e.preventDefault();
                }

                const container = this.$refs.container;
                const containerWidth = container.clientWidth;

                const xOffset = container.getBoundingClientRect().left + window.pageXOffset;
                const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
                const left = pageX - xOffset;

                let a;
                if (left < 0) {
                    a = 0;
                } else if (left > containerWidth) {
                    a = 1;
                } else {
                    a = Math.round(left * 100 / containerWidth) / 100;
                }

                if (this.colors.a !== a) {
                    this.$emit('change', {
                        h: this.colors.hsl.h,
                        s: this.colors.hsl.s,
                        l: this.colors.hsl.l,
                        a,
                        source: 'rgba',
                    });
                }
            },
            handleMouseDown(e) {
                this.handleChange(e, true);
                window.addEventListener('mousemove', this.handleChange);
                window.addEventListener('mouseup', this.handleMouseUp);
            },
            handleMouseUp() {
                this.unbindEventListeners();
            },
            unbindEventListeners() {
                window.removeEventListener('mousemove', this.handleChange);
                window.removeEventListener('mouseup', this.handleMouseUp);
            },
            handleEscape() {
                this.dispatch('ColorPicker', 'on-escape-keydown');
            },
        },
    };
</script>
