
<script>
    const returnArrayFn = () => [];

    export default {
        props: {
            options: {
                type: Array,
                default: returnArrayFn
            },
        },
        functional: true,
        render(h, {props}){
            return props.options;
        }
    }
</script>

<style>

</style>
