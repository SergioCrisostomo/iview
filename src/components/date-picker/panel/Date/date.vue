<template>
    <div :class="classes" @mousedown.prevent>
        <div :class="[prefixCls + '-sidebar']" v-if="shortcuts.length">
            <div
                :class="[prefixCls + '-shortcut']"
                v-for="shortcut in shortcuts"
                @click="handleShortcutClick(shortcut)">{{ shortcut.text }}</div>
        </div>
        <div :class="[prefixCls + '-body']">
            <div :class="[datePrefixCls + '-header']" v-show="currentView !== 'time'">
                <span
                    :class="iconBtnCls('prev', '-double')"
                    @click="changeYear(-1)"><Icon type="ios-arrow-left"></Icon></span>
                <span
                    :class="iconBtnCls('prev')"
                    @click="changeMonth(-1)"
                    v-show="currentView === 'date'"><Icon type="ios-arrow-left"></Icon></span>
                <date-panel-label
                    :date-panel-label="datePanelLabel"
                    :current-view="currentView"
                    :date-prefix-cls="datePrefixCls"></date-panel-label>
                <span
                    :class="iconBtnCls('next', '-double')"
                    @click="changeYear(+1)"><Icon type="ios-arrow-right"></Icon></span>
                <span
                    :class="iconBtnCls('next')"
                    @click="changeMonth(+1)"
                    v-show="currentView === 'date'"><Icon type="ios-arrow-right"></Icon></span>
            </div>
            <div :class="[prefixCls + '-content']">
                <component
                    :is="pickerTable"
                    ref="pickerTable"
                    :table-date="panelDate"
                    :value="date"
                    :selection-mode="selectionMode"
                    :disabled-date="disabledDate"
                    @on-pick="handlePick"
                    @on-pick-click="handlePickClick"
                ></component>
            </div>
            <div :class="[prefixCls + '-content']" v-show="isTime">
                <time-picker
                    v-if="confirm"
                    :show-time="showTime"
                    :is-time="isTime"
                    :time-disabled="timeDisabled"
                    @on-pick-toggle-time="handleToggleTime"
                    @on-pick-clear="handlePickClear"
                    @on-pick-success="handlePickSuccess"></time-picker>
            </div>
            <Confirm
                v-if="confirm"
                :show-time="showTime"
                :is-time="isTime"
                @on-pick-toggle-time="handleToggleTime"
                @on-pick-clear="handlePickClear"
                @on-pick-success="handlePickSuccess"
            ></Confirm>
        </div>
    </div>
</template>
<script>
    import Icon from '../../../icon/icon.vue';
    import DateTable from '../../base/date-table.vue';
    import YearTable from '../../base/year-table.vue';
    import MonthTable from '../../base/month-table.vue';
    import TimePicker from '../Time/time.vue';
    import Confirm from '../../base/confirm.vue';
    import datePanelLabel from './date-panel-label.vue';

    import Mixin from '../panel-mixin';
    import DateMixin from './date-panel-mixin';
    import Locale from '../../../../mixins/locale';

    import { siblingMonth, formatDateLabels } from '../../util';

    const prefixCls = 'ivu-picker-panel';
    const datePrefixCls = 'ivu-date-picker';

    export default {
        name: 'DatePickerPanel',
        mixins: [ Mixin, Locale, DateMixin ],
        components: { Icon, DateTable, YearTable, MonthTable, TimePicker, Confirm, datePanelLabel },
        props: {
            // in the mixin
        },
        data () {
            const date = this.value.sort()[0];
            return {
                prefixCls: prefixCls,
                datePrefixCls: datePrefixCls,
                currentView: this.selectionMode || 'date',
                date: date || new Date(),
                panelDate: date || new Date()
            };
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}-body-wrapper`,
                    {
                        [`${prefixCls}-with-sidebar`]: this.shortcuts.length
                    }
                ];
            },
            month(){
              return this.date.getMonth();
            },
            year(){
                return this.date.getFullYear();
            },
            pickerTable(){
              return this.currentView.match(/^time/) ? 'time-picker' : `${this.currentView}-table`;
            },
            datePanelLabel () {
                if (!this.year) return null; // not ready yet
                const locale = this.t('i.locale');
                const datePanelLabel = this.t('i.datepicker.datePanelLabel');
                const date = new Date(this.year, this.month);
                const { labels, separator } = formatDateLabels(locale, datePanelLabel, date);

                const handler = type => {
                    return () => (this.currentView = type);
                };

                return {
                    separator: separator,
                    labels: labels.map(obj => ((obj.handler = handler(obj.type)), obj))
                };
            },
        },
        watch: {
            value (newVal) {
                let date = newVal && newVal[0];
                if (!date) return;
                date = new Date(date);
                if (!isNaN(date)) {
                    this.date = date;
                }
            },
            selectionMode(){
                this.currentView = this.selectionMode;
            },
            currentView (val) {
                console.log('chaning currentView to', val);
                this.$emit('on-selection-mode-change', val);
                if (val === 'time') this.$refs.pickerTable.updateScroll();
            }
        },
        methods: {
            handleClear () {
                this.date = new Date();
                this.$emit('on-pick', '');
                if (this.showTime) this.$refs.pickerTable.handleClear();
            },
            changeYear(dir){
                if (this.currentView === 'year') {
                    this.$refs.pickerTable[dir == 1 ? 'nextTenYear' : 'prevTenYear']();
                } else {
                    this.date = siblingMonth(this.date, dir * 12);
                }
            },
            changeMonth(dir){
                this.date = siblingMonth(this.date, dir);
            },
            handleToggleTime () {
                const newView = this.currentView === 'date' ? 'time' : 'date';
                this.currentView = newView;
            },
/*
            handleYearPick(year, close = true) {
                this.year = year;
                if (!close) return;

                this.date.setFullYear(year);
                if (this.selectionMode === 'year') {
                    this.$emit('on-pick', new Date(year, 0, 1));
                } else {
                    this.currentView = 'month';
                }

                this.resetDate();
            },
            handleMonthPick (month) {
                this.month = month;
                this.date.setMonth(month);
                if (this.selectionMode !== 'month') {
                    this.currentView = 'date';
                    this.resetDate();
                } else {
                    this.year && this.date.setFullYear(this.year);
                    this.resetDate();
                    const value = new Date(this.date.getFullYear(), month, 1);
                    this.$emit('on-pick', value);
                }
            },
*/
            handlePick (value, close = true) {
                const {selectionMode, date} = this;
                console.log('handle pick', value, close, selectionMode, date);

                if (selectionMode === 'year') value = new Date(value, 0, 1);
                else if (selectionMode === 'month') value = new Date(date.getFullYear(), value, 1);

                this.date = new Date(value);
                this.$emit('on-pick', new Date(value.getTime()));

            },
        },
        mounted () {
            if (this.showTime) {
                // todo 这里可能有问题，并不能进入到这里，但不影响正常使用

/*
                TODO (pickerTable ?)
                this.$refs.timePicker.date = this.date;
                this.$refs.timePicker.value = this.value;
                this.$refs.timePicker.showDate = true;
*/
            }
        }
    };
</script>
