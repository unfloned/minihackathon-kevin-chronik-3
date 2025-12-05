import type { DeadlineSimple, DeadlinePriority } from '@ycmm/core';

// Alias for component usage
export type Deadline = DeadlineSimple;
export type Priority = DeadlinePriority;

export interface DeadlineFormData {
  title: string;
  description: string;
  dueDate: Date | null;
  priority: DeadlinePriority;
  category: string;
}

export const defaultFormData: DeadlineFormData = {
  title: '',
  description: '',
  dueDate: null,
  priority: 'medium',
  category: '',
};

export const priorityColors: Record<DeadlinePriority, string> = {
  low: 'blue',
  medium: 'yellow',
  high: 'orange',
  urgent: 'red',
};

export const priorityOptions = [
  { value: 'low', labelKey: 'deadlines.priority.low' },
  { value: 'medium', labelKey: 'deadlines.priority.medium' },
  { value: 'high', labelKey: 'deadlines.priority.high' },
  { value: 'urgent', labelKey: 'deadlines.priority.urgent' },
];
