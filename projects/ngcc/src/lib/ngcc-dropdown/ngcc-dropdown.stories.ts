import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccDropdownItem } from './ngcc-dropdown.types';
import { NgccDropdown } from './ngcc-dropdown';

const sampleItems: NgccDropdownItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Disabled item', value: 'disabled', disabled: true },
];

const meta: Meta<NgccDropdown> = {
  title: 'Components/Dropdown',
  component: NgccDropdown,
  decorators: [
    moduleMetadata({
      imports: [NgccDropdown, NgccIcon, ReactiveFormsModule],
    }),
  ],
  tags: ['autodocs'],
  args: {
    label: 'Select an option',
    placeholder: 'Choose...',
    size: 'md',
    disabled: false,
    multi: false,
    required: false,
    readonly: false,
    skeleton: false,
    helperText: '',
    errorMessage: '',
    invalid: undefined,
    ariaLabel: '',
    items: sampleItems,
  },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    multi: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    ariaLabel: { control: 'text' },
    invalid: { control: 'boolean' },
    valueChange: { action: 'valueChange' },
  },
};
export default meta;

type Story = StoryObj<NgccDropdown>;

export const Default: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Pick a fruit',
    multi: false,
  },
};

export const MultiSelect: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Pick one or more',
    multi: true,
  },
};

export const WithHelperText: Story = {
  args: {
    helperText: 'Select a fruit from the list',
  },
};

export const WithErrorMessage: Story = {
  args: {
    invalid: true,
    errorMessage: 'Custom error message',
  },
};

export const SkeletonLoading: Story = {
  args: {
    skeleton: true,
  },
};

export const ReactiveFormValidation: Story = {
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      country: fb.control('', Validators.required),
      city: fb.control('', [Validators.required, Validators.minLength(3)]),
    });

    const countries = [
      { label: 'India', value: 'in' },
      { label: 'United States', value: 'us' },
      { label: 'Germany', value: 'de' },
    ];
    const cities = [
      { label: 'Delhi', value: 'delhi' },
      { label: 'Berlin', value: 'berlin' },
      { label: 'NY', value: 'ny' }, // minlength error test
    ];

    return {
      props: { form, countries, cities },
      template: `
        <form [formGroup]="form" style="display:flex; flex-direction:column; gap:1rem; max-width:400px;">
          <ngcc-dropdown
            label="Country"
            formControlName="country"
            [items]="countries"
            required="true"
            placeholder="Select country"
          ></ngcc-dropdown>

          <ngcc-dropdown
            multi='true'
            label="City"
            formControlName="city"
            [items]="cities"
            required="true"
            placeholder="Select city"
            helperText='Minimum 3'
          ></ngcc-dropdown>

          <div style="margin-top: 1rem;">
            <strong>Form status:</strong> {{ form.status }}<br />
            Country errors: {{ form.get('country')?.errors | json }}<br />
            City errors: {{ form.get('city')?.errors | json }}
          </div>
        </form>
      `,
    };
  },
};
