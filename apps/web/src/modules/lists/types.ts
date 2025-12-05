import type { ListSimple, ListType } from '@ycmm/core';
import {
    IconList,
    IconShoppingCart,
    IconChecklist,
    IconBriefcase,
    IconCheckbox,
    IconClipboardList,
} from '@tabler/icons-react';

// Alias for component usage
export type List = ListSimple;

export interface ListTypeOption {
    value: string;
    label: string;
}

export interface NewListData {
    name: string;
    description: string;
    type: ListType;
    color: string;
}

export const listTypeIcons: Record<string, typeof IconList> = {
    shopping: IconShoppingCart,
    todo: IconChecklist,
    packing: IconBriefcase,
    checklist: IconCheckbox,
    custom: IconClipboardList,
};

export const defaultNewListData: NewListData = {
    name: '',
    description: '',
    type: 'todo',
    color: '#228be6',
};

export const colorSwatches = [
    '#228be6',
    '#40c057',
    '#fab005',
    '#fd7e14',
    '#fa5252',
    '#be4bdb',
    '#7950f2',
    '#15aabf',
];
