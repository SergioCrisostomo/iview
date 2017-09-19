<template>
    <table cellspacing="0" cellpadding="0" border="0" :style="styleObject">
        <colgroup>
            <col v-for="(column, index) in columns" :width="setCellWidth(column, index, false)">
        </colgroup>
        <tbody :class="[prefixCls + '-tbody']">
            <template v-for="(row, index) in data">
                <table-tr
                    :row="row"
                    :key="row._rowKey"
                    :prefix-cls="prefixCls"
                    @mouseenter.native.stop="handleMouseIn(row._index)"
                    @mouseleave.native.stop="handleMouseOut(row._index)"
                    @click.native="clickCurrentRow(row._index)"
                    @dblclick.native.stop="dblclickCurrentRow(row._index)">
                    <td v-for="(column, i) in columns" :class="alignCls(column, row)">
                        <Cell
                            :fixed="fixed"
                            :prefix-cls="prefixCls"
                            :cellStyle="{height: getOriginalTdHeight(index, i)}"
                            :row="row"
                            :key="column._columnKey"
                            :column="column"
                            :natural-index="index"
                            :index="row._index"
                            :checked="rowChecked(row._index)"
                            :disabled="rowDisabled(row._index)"
                            :expanded="rowExpanded(row._index)"
                        ></Cell>
                    </td>
                </table-tr>
                <tr v-if="rowExpanded(row._index)">
                    <td :colspan="columns.length" :class="prefixCls + '-expanded-cell'">
                        <Expand :key="row._rowKey" :row="row" :render="expandRender" :index="row._index"></Expand>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>
<script>
    // todo :key="row"
    import TableTr from './table-tr.vue';
    import Cell from './cell.vue';
    import Expand from './expand.js';
    import Mixin from './mixin';
    import { oneOf, getStyle, deepCopy, getScrollBarSize } from '../../utils/assist';


    export default {
        name: 'TableBody',
        mixins: [ Mixin ],
        components: { Cell, Expand, TableTr },
        props: {
            prefixCls: String,
            styleObject: Object,
            columns: Array,
            data: Array,    // rebuildData
            objData: Object,
            columnsWidth: Object,
            mainTbody: {type: Boolean, default: false}, // to know if this is original table and not clone
            fixed: {
                type: [Boolean, String],
                default: false
            }
        },
        computed: {
            expandRender () {
                let render = function () {
                    return '';
                };
                for (let i = 0; i < this.columns.length; i++) {
                    const column = this.columns[i];
                    if (column.type && column.type === 'expand') {
                        if (column.render) render = column.render;
                    }
                }
                return render;
            },
            mainTableRows(){
                const tbody = !this.mainTbody && this.$parent.$refs.tbody.$el;
                return tbody ? tbody.querySelectorAll('tbody tr') : null;
            }
        },
        methods: {
            rowChecked (_index) {
                return this.objData[_index] && this.objData[_index]._isChecked;
            },
            rowDisabled(_index){
                return this.objData[_index] && this.objData[_index]._isDisabled;
            },
            rowExpanded(_index){
                return this.objData[_index] && this.objData[_index]._isExpanded;
            },
            handleMouseIn (_index) {
                this.$parent.handleMouseIn(_index);
            },
            handleMouseOut (_index) {
                this.$parent.handleMouseOut(_index);
            },
            clickCurrentRow (_index) {
                this.$parent.clickCurrentRow(_index);
            },
            dblclickCurrentRow (_index) {
                this.$parent.dblclickCurrentRow(_index);
            },
            getRowHeight(row, index){
                if (!this.mainTableRows) return null;
                const height = getStyle(this.mainTableRows[index], height);
                return this.mainTableRows[index].offsetHeight - 1 + 'px';
            },
            getOriginalTdHeight(index, i){
                if (!this.mainTableRows) return null;
                const row  = this.mainTableRows[index];
                const tds = row && row.querySelectorAll('td');
                const tableCell = tds && tds[i].querySelector('.ivu-table-cell')
                return tableCell && tableCell.offsetHeight + 'px';
            }
        }
    };
</script>
