<template>
    <div id="app">
        <i-select v-model="modelA" multiple style="width:260px">
            <i-option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</i-option>
        </i-select>
        <i-select v-model="modelB" multiple style="width:260px">
            <i-option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</i-option>
        </i-select>
    </div>
</template>

<script>
    const options = [
        {value: 'beijing', label: 'Beijing'},
        {value: 'stockholm', label: 'Stockholm'},
        {value: 'lisboa', label: 'Lisboa'}
    ];
    export default {
        data() {
            return {
                cityList: [],
                modelA: [],
                modelB: []
            };
        },
        mounted() {
            this.$children[0].toggleMenu();
            setTimeout(() => {
                this.cityList = options;
                console.log('options loaded');
            }, 500);
        }
    };
</script>
