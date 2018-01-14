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
                        @click="prevMonth('left')"
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
                        @click="nextMonth('left')"
                        v-show="currentView === 'date'"><Icon type="ios-arrow-right"></Icon></span>
                </div>
                <component
                    :is="pickerTable"
                    ref="leftYearTable"
                    :table-date="leftPanelDate"
                    selection-mode="range"
                    :disabled-date="disabledDate"
                    :range-state="rangeState"
                    :value="dates"
                    @on-change-range="handleChangeRange"
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
                        @click="prevMonth('right')"
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
                        @click="nextMonth('right')"
                        v-show="currentView === 'date'"><Icon type="ios-arrow-right"></Icon></span>
                </div>
                <component
                    :is="pickerTable"
                    ref="rightYearTable"
                    :table-date="rightPanelDate"
                    selection-mode="range"
                    :range-state="rangeState"
                    :disabled-date="disabledDate"
                    :value="dates"
                    @on-change-range="handleChangeRange"
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
            const [minDate, maxDate] = this.value.map(date => date || initTimeDate());
            return {
                prefixCls: prefixCls,
                datePrefixCls: datePrefixCls,
                dates: [minDate, maxDate],
                rangeState: {from: minDate, to: maxDate, selecting: minDate && !maxDate},
                currentView: this.selectionMode,
                leftPanelDate: minDate,
                rightPanelDate: new Date(minDate.getFullYear(), minDate.getMonth() + 1, minDate.getDate())
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
            leftDatePanelLabel(){
                return this.panelLabelConfig('left');
            },
            rightDatePanelLabel(){
                return this.panelLabelConfig('right');
            },
            timeDisabled(){
                return !(this.dates[0] && this.dates[1]);
            }
        },
        watch: {
            value(newVal) {
                const minDate = newVal[0] ? toDate(newVal[0]) : null;
                const maxDate = newVal[1] ? toDate(newVal[1]) : null;
                this.dates = [minDate, maxDate];
                this.rangeState = {
                    from: minDate,
                    to: maxDate,
                    selecting: false
                }
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
            },
            currentView(currentView){
                const leftMonth = this.leftPanelDate.getMonth();
                const rightMonth = this.rightPanelDate.getMonth();
                const isSameYear = this.leftPanelDate.getFullYear() === this.rightPanelDate.getFullYear();

                if (currentView === 'date' && isSameYear && leftMonth === rightMonth){
                    this.changePanelDate('right', 'Month', 1);
                }
                console.log(currentView, isSameYear);
                if (currentView === 'month' && isSameYear){
                    this.changePanelDate('right', 'FullYear', 1);
                }
                if (currentView === 'year' && isSameYear){
                    this.changePanelDate('right', 'FullYear', 10);
                }
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

                const date = this[`${direction}PanelDate`];
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
                this.dates = this.dates.map(() => new Date());
                this.rangeState = {};
                this.handleConfirm();
              //  if (this.showTime) this.$refs.timePicker.handleClear();
            },
            resetView(reset = false) {
                this.currentView = 'date';
            },
            prevYear (direction) {
                this.changePanelDate(direction, 'FullYear', -1);
            },
            nextYear (direction) {
                this.changePanelDate(direction, 'FullYear', 1);
            },
            prevMonth(direction){
                this.changePanelDate(direction, 'Month', -1);
            },
            nextMonth(direction){
                this.changePanelDate(direction, 'Month', 1);
            },
            changePanelDate(panel, type, increment){
                const current = new Date(this[`${panel}PanelDate`]);
                current[`set${type}`](current[`get${type}`]() + increment);
                this[`${panel}PanelDate`] = current;

                // change other panels if they overlap
                const otherPanel = panel === 'left' ? 'right' : 'left';
                if (panel === 'left' && this.leftPanelDate >= this.rightPanelDate){
                    this.changePanelDate(otherPanel, type, 1);
                }
                if (panel === 'right' && this.rightPanelDate <= this.leftPanelDate){
                    this.changePanelDate(otherPanel, type, -1);
                }
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

                const index = direction === 'left' ? 0 : 1;
                this.dates[index].setYear(year);
                this.dates[index].setMonth(month);
                this[`${direction}CurrentView`] = 'date';
                this.resetDate();
            },
            showYearPicker () {
                this.currentView = 'year';
            },
            showMonthPicker () {
                this.currentView = 'month';
            },
            handleConfirm(visible) {
                this.$emit('on-pick', this.dates, visible);
            },
            handleRangePick (val) {
                if (this.rangeState.selecting){
                    const [minDate, maxDate] = [this.rangeState.from, val].sort((a, b) => a - b);

                    this.dates = [minDate, maxDate];
                    this.rangeState = {
                        from: minDate,
                        to: maxDate,
                        selecting: false
                    };
                    this.handleConfirm(false);
                } else {
                    this.rangeState = {
                        from: val,
                        to: null,
                        selecting: true
                    };
                }
            },
            handleChangeRange (val) {
                this.rangeState.to = val;
            },
            handleToggleTime(){
                this.currentView = 'date';
            },
            handleTimePick (date) {
                this.dates = date
                this.handleConfirm(false);
            }
        },
        mounted(){
            if (this.showTime) {
                // todo 这里也到不了

/*
                TODO
                this.$refs.timePicker.date = this.dates[0];
                this.$refs.timePicker.dateEnd = this.dates[1];
                this.$refs.timePicker.value = this.value;
                this.$refs.timePicker.showDate = true;
*/
            }
        }
    };
</script>
