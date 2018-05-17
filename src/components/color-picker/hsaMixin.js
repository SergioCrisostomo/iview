import Emitter from '../../mixins/emitter';
import handleEscapeMixin from './handleEscapeMixin';
import {getTouches} from './utils';

export default {
    mixins: [Emitter, handleEscapeMixin],

    props: {
        value: {
            type: Object,
            default: undefined,
        },
    },

    beforeDestroy() {
        this.unbindEventListeners();
    },

    methods: {
        handleLeft(e) {
            this.handleSlide(e, this.left, 'left');
        },
        handleRight(e) {
            this.handleSlide(e, this.right, 'right');
        },
        handleUp(e) {
            this.handleSlide(e, this.up, 'up');
        },
        handleDown(e) {
            this.handleSlide(e, this.down, 'down');
        },
        handleMouseDown(e) {
            this.dispatch('ColorPicker', 'on-dragging', true);
            this.handleChange(e, true);
            window.addEventListener('mousemove', this.handleChange, false);
            window.addEventListener('mouseup', this.handleMouseUp, false);
        },
        handleMouseUp() {
            this.unbindEventListeners();
        },
        unbindEventListeners() {
            window.removeEventListener('mousemove', this.handleChange);
            window.removeEventListener('mouseup', this.handleMouseUp);
            // This timeout is required so that the click handler for click-outside
            // has the chance to run before the mouseup removes the dragging flag.
            setTimeout(() => this.dispatch('ColorPicker', 'on-dragging', false), 1);
        },
        getLeft(e) {
            const {container} = this.$refs;
            const xOffset = container.getBoundingClientRect().left + window.pageXOffset;
            const pageX = e.pageX || getTouches(e, 'PageX');

            return pageX - xOffset;
        },
        getTop(e) {
            const {container} = this.$refs;
            const yOffset = container.getBoundingClientRect().top + window.pageYOffset;
            const pageY = e.pageY || getTouches(e, 'PageY');

            return pageY - yOffset;
        },
    },
};
