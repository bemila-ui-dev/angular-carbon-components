export type DropdownSize = 'sm' | 'md' | 'lg';

export interface NgccDropdownItem<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}
