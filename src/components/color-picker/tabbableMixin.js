export default {
    props: {
        tabbable: {
            type: Boolean,
            required: true,
        },
    },

    methods: {
        getTabindex(value) {
            return value ? 1 : 0;
        },
    },
};
