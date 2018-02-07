import {
    BOTTOM,
} from '@/utils/constants';
import {
    PLACEMENT_LIST,
    PLACEMENT_MAP,
} from '@/utils/enums';
import {
    oneOf,
} from '@/utils/assist';

export const debounce = (fn) => {
    let waiting;

    return function bound(...args){
        if (waiting) {
            return;
        }

        waiting = true;

        this.$nextTick(() => {
            waiting = false;
            fn(args);
        });
    };
};

export const uniq = array => [...new Set(array)];

export const isUniq = array => uniq(array).length === array.length;

export const isEqualOption = (a, b) => a.label === b.label && a.value === b.value;

export const isUniqOptions = (array) => {
    const isIncluded = (option, index) => {
        const isMatch = item => isEqualOption(option, item);

        return array.slice(index + 1).find(isMatch);
    };

    return !array.some(isIncluded);
};

export const getPlacement = (placement) => {
    const mapped = PLACEMENT_MAP[placement];

    return oneOf(mapped, PLACEMENT_LIST) ? mapped : BOTTOM;
};
