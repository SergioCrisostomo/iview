<template>
    <div :class="classes" @mousedown.prevent>
        <div :class="[prefixCls + '-sidebar']" v-if="shortcuts.length">
            <div
                :class="[prefixCls + '-shortcut']"
                v-for="shortcut in shortcuts"
                @click="handleShortcutClick(shortcut)">{{ shortcut.text }}</div>
        </div>
        <div :class="[prefixCls + '-body']">
            <div :class="[prefixCls + '-content', prefixCls + '-content-left']" v-show="!isTime">
                <div :class="[datePrefixCls + '-header']" v-show="currentView !== 'time'">
                    <span
                        :class="iconBtnCls('prev', '-double')"
                        @click="prevYear('left')"><Icon type="ios-arrow-left"></Icon></span>
                    <span
                        :class="iconBtnCls('prev')"
                        @click="prevMonth()"
                        v-show="currentView === 'date'"><Icon type="ios-arrow-left"></Icon></span>
                    <date-panel-label
                        :date-panel-label="leftDatePanelLabel"
                        :current-view="currentView"
                        :date-prefix-cls="datePrefixCls"></date-panel-label>
                    <span
                        :class="iconBtnCls('next', '-double')"
                        @click="nextYear('left')"><Icon type="ios-arrow-right"></Icon></span>
                    <span
                        :class="iconBtnCls('next')"
                        @click="nextMonth()"
                        v-show="currentView === 'date'"><Icon type="ios-arrow-right"></Icon></span>
                </div>
                <component
                    :is="pickerTable"
                    ref="leftYearTable"
                    :year="leftYear"
                    :month="leftMonth"
                    panel-function="left"
                    selection-mode="range"
                    :disabled-date="disabledDate"
                    :value="dates"
                    @on-changerange="handleChangeRange"
                    @on-pick="handleRangePick"
                    @on-pick-click="handlePickClick"
                ></component>
            </div>
            <div :class="[prefixCls + '-content', prefixCls + '-content-right']" v-show="!isTime">
                <div :class="[datePrefixCls + '-header']" v-show="currentView !== 'time'">
                    <span
                        :class="iconBtnCls('prev', '-double')"
                        @click="prevYear('right')"><Icon type="ios-arrow-left"></Icon></span>
                    <span
                        :class="iconBtnCls('prev')"
                        @click="prevMonth()"
                        v-show="currentView === 'date'"><Icon type="ios-arrow-left"></Icon></span>
                    <date-panel-label
                        :date-panel-label="rightDatePanelLabel"
                        :current-view="currentView"
                        :date-prefix-cls="datePrefixCls"></date-panel-label>
                    <span
                        :class="iconBtnCls('next', '-double')"
                        @click="nextYear('right')"><Icon type="ios-arrow-right"></Icon></span>
                    <span
                        :class="iconBtnCls('next')"
                        @click="nextMonth()"
                        v-show="currentView === 'date'"><Icon type="ios-arrow-right"></Icon></span>
                </div>
                <component
                    :is="pickerTable"
                    ref="rightYearTable"
                    :year="rightYear"
                    :month="rightMonth"
                    panel-function="right"
                    selection-mode="range"
                    :disabled-date="disabledDate"
                    :value="dates"
                    @on-changerange="handleChangeRange"
                    @on-pick="handleRangePick"
                    @on-pick-click="handlePickClick"></component>
            </div>
            <div :class="[prefixCls + '-content']" v-show="isTime">
                <time-picker
                    ref="timePicker"
                    v-show="isTime"
                    :format="format"
                    @on-pick="handleTimePick"
                    @on-pick-click="handlePickClick"></time-picker>
            </div>
            <Confirm
                v-if="confirm"
                :show-time="showTime"
                :is-time="isTime"
                :time-disabled="timeDisabled"
                @on-pick-toggle-time="handleToggleTime"
                @on-pick-clear="handlePickClear"
                @on-pick-success="handlePickSuccess"></Confirm>
        </div>
    </div>
</template>
<script>
    import Icon from '../../../icon/icon.vue';
    import DateTable from '../../base/date-table.vue';
    import YearTable from '../../base/year-table.vue';
    import MonthTable from '../../base/month-table.vue';
    import TimePicker from '../Time/time-range.vue';
    import Confirm from '../../base/confirm.vue';

    import { toDate, prevMonth, nextMonth, initTimeDate, formatDateLabels } from '../../util';
    import datePanelLabel from './date-panel-label.vue';

    import Mixin from '../panel-mixin';
    import DateMixin from './date-panel-mixin';
    import Locale from '../../../../mixins/locale';

    const prefixCls = 'ivu-picker-panel';
    const datePrefixCls = 'ivu-date-picker';

    export default {
        name: 'RangeDatePickerPanel',
        mixins: [ Mixin, Locale, DateMixin ],
        components: { Icon, DateTable, YearTable, MonthTable, TimePicker, Confirm, datePanelLabel },
        props: {
            // in the mixin
        },
        data(){
            const dates = this.value.map(date => date || initTimeDate());

            return {
                prefixCls: prefixCls,
                datePrefixCls: datePrefixCls,
                dates: dates,
                minDate: '',
                maxDate: '',
                currentView: this.selectionMode,
            };
        },
        computed: {
            classes(){
                return [
                    `${prefixCls}-body-wrapper`,
                    `${datePrefixCls}-with-range`,
                    {
                        [`${prefixCls}-with-sidebar`]: this.shortcuts.length
                    }
                ];
            },
            pickerTable(){
                return `${this.currentView}-table`;
            },
            leftYear(){
                return this.dates[0].getFullYear();
            },
            leftTableDate(){
                return this.dates[0];
            },
            leftMonth(){
                return this.dates[0].getMonth();
            },
            rightYear(){
                return this.rightTableDate.getFullYear();
            },
            rightTableDate(){
                return this.dates[1];
            },
            rightMonth(){
                return this.rightTableDate.getMonth();
            },
            leftDatePanelLabel(){
                if (!this.leftYear) return null; // not ready yet
                return this.panelLabelConfig('left');
            },
            rightDatePanelLabel(){
                if (!this.leftYear) return null; // not ready yet
                return this.panelLabelConfig('right');
            },
            timeDisabled(){
                return !(this.minDate && this.maxDate);
            }
        },
        watch: {
            value(newVal) {
                this.minDate = newVal[0] ? toDate(newVal[0]) : null;
                this.maxDate = newVal[1] ? toDate(newVal[1]) : null;
                this.dates[0] = new Date(this.minDate);
                this.dates[1] = new Date(this.maxDate);

               // if (this.showTime) this.$refs.timePicker.value = this.dates;
            },
            minDate (val) {
               // if (this.showTime) this.$refs.timePicker.dates = val;
            },
            maxDate (val) {
                //if (this.showTime) this.$refs.timePicker.dateEnd = val;
            },
            isTime (val) {
                if (val) this.$refs.timePicker.updateScroll();
            }
        },
        methods: {
            panelLabelConfig (direction) {
                const locale = this.t('i.locale');
                const datePanelLabel = this.t('i.datepicker.datePanelLabel');
                const handler = type => {
                    const fn = type == 'month' ? this.showMonthPicker : this.showYearPicker;
                    return () => fn(direction);
                };

                const date = new Date(this[`${direction}Year`], this[`${direction}Month`]);
                const { labels, separator } = formatDateLabels(locale, datePanelLabel, date);

                return {
                    separator: separator,
                    labels: labels.map(obj => ((obj.handler = handler(obj.type)), obj))
                };
            },
            resetDate(){
                this.dates = this.dates.map(date => new Date(date));
            },
            handleClear() {
                this.minDate = null;
                this.maxDate = null;
                this.dates = this.dates.map(() => new Date());
                this.handleConfirm();
              //  if (this.showTime) this.$refs.timePicker.handleClear();
            },
            resetView(reset = false) {
                this.currentView = 'date';
            },
            prevYear (direction, panel = 0) {
                if (this[`${direction}CurrentView`] === 'year') {
                    this.$refs[`${direction}YearTable`].prevTenYear();
                } else if (this[`${direction}CurrentView`] === 'month') {
                    this[`${direction}TableYear`]--;
                } else {
                    const date = this.dates[panel];
                    date.setFullYear(date.getFullYear() - 1);
                    this.resetDate();
                }
            },
            nextYear (direction, panel = 1) {
                if (this[`${direction}CurrentView`] === 'year') {
                    this.$refs[`${direction}YearTable`].nextTenYear();
                } else if (this[`${direction}CurrentView`] === 'month') {
                    this[`${direction}TableYear`]++;
                } else {
                    const date = this.dates[panel];
                    date.setFullYear(date.getFullYear() + 1);
                    this.resetDate();
                }
            },
            prevMonth(panel = 0){
                this.dates[panel] = prevMonth(this.date[panel]);
            },
            nextMonth(panel = 1){
                this.dates[panel] = nextMonth(this.date[panel]);
            },
            handleLeftYearPick (year, close = true) {
                this.handleYearPick(year, close, 'left');
            },
            handleRightYearPick (year, close = true) {
                this.handleYearPick(year, close, 'right');
            },
            handleYearPick (year, close, direction) {
                this[`${direction}TableYear`] = year;
                if (!close) return;

                this[`${direction}CurrentView`] = 'month';
            },
            handleLeftMonthPick (month) {
                this.handleMonthPick(month, 'left');
            },
            handleRightMonthPick (month) {
                this.handleMonthPick(month, 'right');
            },
            handleMonthPick (month, direction) {
                let year = this[`${direction}TableYear`];
                if (direction === 'right') {
                    if (month === 0) {
                        month = 11;
                        year--;
                    } else {
                        month--;
                    }
                }

                this.dates[direction === 'left' ? 0 : 1].setYear(year);
                this.dates[direction === 'left' ? 0 : 1].setMonth(month);
                this[`${direction}CurrentView`] = 'date';
                this.resetDate();
            },
            showYearPicker (direction) {
                this[`${direction}CurrentView`] = 'year';
                this[`${direction}TableYear`] = this[`${direction}Year`];
            },
            showMonthPicker (direction) {
                this[`${direction}CurrentView`] = 'month';
            },
            handleConfirm(visible) {
                this.$emit('on-pick', [this.minDate, this.maxDate], visible);
            },
            handleRangePick (val, close = true) {
                if (this.maxDate === val.maxDate && this.minDate === val.minDate) return;

                this.minDate = val.minDate;
                this.maxDate = val.maxDate;

                // todo Remove when Chromium has fixed bug
                // https://github.com/iview/iview/issues/2122
                this.$nextTick(() => {
                    this.minDate = val.minDate;
                    this.maxDate = val.maxDate;
                });
                /* end of #2122 patch */

                if (!close) return;
//                if (!this.showTime) {
//                    this.handleConfirm(false);
//                }
                this.handleConfirm(false);
            },
            handleChangeRange (val) {
                this.minDate = val.minDate;
                this.maxDate = val.maxDate;
            },
            handleToggleTime(){
                this.currentView = 'date';
            },
            handleTimePick (date) {
                this.minDate = date[0];
                this.maxDate = date[1];
                this.handleConfirm(false);
            }
        },
        mounted(){
            if (this.showTime) {
                // todo 这里也到不了

/*
                TODO
                this.$refs.timePicker.date = this.minDate;
                this.$refs.timePicker.dateEnd = this.maxDate;
                this.$refs.timePicker.value = this.value;
                this.$refs.timePicker.showDate = true;
*/
            }
        }
    };
</script>
