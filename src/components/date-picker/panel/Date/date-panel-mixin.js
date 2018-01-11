
import { oneOf } from '../../../../utils/assist';

export default {
    props: {
        confirm: {
            type: Boolean,
            default: false
        },
        showTime: {
            type: Boolean,
            default: false
        },
        format: {
            type: String,
            default: 'yyyy-MM-dd'
        },
        selectionMode: {
            type: String,
            validator (value) {
                return oneOf(value, ['year', 'month', 'date']);
            },
            default: 'date'
        },
        shortcuts: {
            type: Array,
            default: () => []
        },
        disabledDate: {
            type: Function,
            default: () => false
        }
    },
}