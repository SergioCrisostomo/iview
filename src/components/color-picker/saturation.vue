<template>
    <div
        :tabindex="tabbable ? 1 : 0"
        class="ivu-color-picker-saturation-wrapper"
        @keydown.esc="handleEscape"
    >
        <div
            ref="container"
            :style="{background: bgColor}"
            class="ivu-color-picker-saturation"
            @mousedown="handleMouseDown">
            <div class="ivu-color-picker-saturation--white"></div>
            <div class="ivu-color-picker-saturation--black"></div>
            <div
                :style="{top: pointerTop, left: pointerLeft}"
                class="ivu-color-picker-saturation-pointer">
                <div class="ivu-color-picker-saturation-circle"></div>
            </div>
        </div>
    </div>
</template>
<script>
    import throttle from 'lodash.throttle';
    import Emitter from '../../mixins/emitter';

    export default {
        name: 'Saturation',
        mixins: [Emitter],
        props: {
            tabbable: {
                type: Boolean,
                required: true,
            },
            value: Object,
            visible: {
                type: Boolean,
                required: true,
            },
        },
        data() {
            return {};
        },
        computed: {
            colors() {
                return this.value;
            },
            bgColor() {
                return `hsl(${this.colors.hsv.h}, 100%, 50%)`;
            },
            pointerTop() {
                return `${-(this.colors.hsv.v * 100) + 1 + 100}%`;
            },
            pointerLeft() {
                return `${this.colors.hsv.s * 100}%`;
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
            throttle: throttle(
                (fn, data) => {
                    fn(data);
                },
                20,
                {
                    leading: true,
                    trailing: false,
                },
            ),
            handleChange(e, skip) {
                if (!skip) {
                    e.preventDefault();
                }

                const container = this.$refs.container;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const xOffset = container.getBoundingClientRect().left + window.pageXOffset;
                const yOffset = container.getBoundingClientRect().top + window.pageYOffset;
                const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
                const pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0);
                let left = pageX - xOffset;
                let top = pageY - yOffset;
                if (left < 0) {
                    left = 0;
                } else if (left > containerWidth) {
                    left = containerWidth;
                } else if (top < 0) {
                    top = 0;
                } else if (top > containerHeight) {
                    top = containerHeight;
                }
                const saturation = left / containerWidth;
                let bright = -(top / containerHeight) + 1;
                bright = bright > 0 ? bright : 0;
                bright = bright > 1 ? 1 : bright;
                this.throttle(this.onChange, {
                    h: this.colors.hsv.h,
                    s: saturation,
                    v: bright,
                    a: this.colors.hsv.a,
                    source: 'hsva',
                });
            },
            onChange(param) {
                this.$emit('change', param);
            },
            handleMouseDown() {
                window.addEventListener('mousemove', this.handleChange);
                window.addEventListener('mouseup', this.handleChange);
                window.addEventListener('mouseup', this.handleMouseUp);
            },
            handleMouseUp() {
                this.unbindEventListeners();
            },
            unbindEventListeners() {
                window.removeEventListener('mousemove', this.handleChange);
                window.removeEventListener('mouseup', this.handleChange);
                window.removeEventListener('mouseup', this.handleMouseUp);
            },
            handleEscape() {
                this.dispatch('ColorPicker', 'on-escape-keydown');
            },
        },
    };
</script>
