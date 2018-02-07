<template>
    <div
        :class="dropdownClasses"
        :style="styles"
    >
        <slot></slot>
    </div>
</template>

<script>
    import Vue from 'vue';
    import Popper from 'popper.js';
    import SELECT_NAME from './selectName';
    import DROPDOWN_NAME from './dropdownName';
    import PREFIXCLS from './prefixCls';
    import {
        getPlacement,
    } from './utils';
    import {
        BODY,
        BOTTOM,
        DROPDOWN,
        EMPTY_STRING,
        START,
        WIDTH,
    } from '@/utils/constants';
    import {
        getStyle,
        kebabJoin,
    } from '@/utils/assist';
    import {
        EVENT_ON_DESTROY_POPPER,
        EVENT_ON_UPDATE_POPPER,
    } from '@/utils/eventNames';

    const isServer = Vue.prototype.$isServer;
    const prefixCls = kebabJoin(PREFIXCLS, DROPDOWN);

    export default {
        name: DROPDOWN_NAME,

        props: {
            className: {
                default: undefined,
                type: String,
            },
            placement: {
                default: kebabJoin(BOTTOM, START),
                type: String,
            },
        },

        data(){
            return {
                popper: null,
                width: EMPTY_STRING,
            };
        },

        computed: {
            dropdownClasses(){
                const className = this.className ? this.className.trim() : this.className;

                return [
                    prefixCls,
                    {
                        [className]: !!className,
                    },
                ];
            },

            styles(){
                if (this.width) {
                    return {
                        width: `${this.width}px`,
                    };
                }

                return {};
            },
        },

        created(){
            this.$on(EVENT_ON_UPDATE_POPPER, this.update);
            this.$on(EVENT_ON_DESTROY_POPPER, this.destroy);
        },

        beforeDestroy(){
            if (this.popper) {
                this.popper.destroy();
            }
        },

        methods: {
            destroy(){
                if (this.popper) {
                    this.resetTransformOrigin(this.popper);

                    setTimeout(() => {
                        if (this.popper) {
                            this.popper.destroy();
                            this.popper = null;
                        }
                    }, 300);
                }
            },

            resetTransformOrigin({_popper}){
                const placement = _popper.getAttribute('x-placement').split('-').shift();

                _popper.style.transformOrigin = `center ${getPlacement(placement)}`;
            },

            update(){
                if (isServer) {
                    return;
                }

                if (this.popper) {
                    this.$nextTick(() => {
                        this.popper.update();
                    });
                } else if (!isServer) {
                    this.$nextTick(() => {
                        this.popper = new Popper(this.$parent.$refs.reference, this.$el, {
                            boundariesElement: BODY,
                            boundariesPadding: 0,
                            forceAbsolute: true,
                            gpuAcceleration: false,
                            onCreate(data){
                                return this.resetTransformOrigin(data);
                            },
                            placement: this.placement,
                        });
                    });
                }

                // set a height for parent is Modal and Select's width is 100%
                if (this.$parent.$options.name === SELECT_NAME) {
                    const width = getStyle(this.$parent.$el, WIDTH);

                    this.width = Number.parseInt(width, 10);
                }
            },
        },
    };
</script>
