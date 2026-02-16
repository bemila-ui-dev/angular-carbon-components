import type { Meta, StoryObj } from '@storybook/angular';
import { NgccIcon } from './ngcc-icon';
import { ICONS, NgccIconNameType } from './icons';

const meta: Meta<NgccIcon> = {
  title: 'Components/Icon',
  component: NgccIcon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: { type: 'select' },
      options: Object.keys(ICONS) as NgccIconNameType[],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 2, 3, 4], // presets + numbers
    },
    color: { control: 'color' },
    ariaLabel: { control: 'text' },
    decorative: { control: 'boolean' },
    svgClass: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<NgccIcon>;

export const Default: Story = {
  args: {
    name: 'add',
    size: 'md',
    color: 'currentColor',
    ariaLabel: 'Add',
  },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <ngcc-icon name="add" size="sm"></ngcc-icon>
        <ngcc-icon name="add" size="md"></ngcc-icon>
        <ngcc-icon name="add" size="lg"></ngcc-icon>
        <ngcc-icon name="add" size="xl"></ngcc-icon>
        <ngcc-icon name="add" [size]="2"></ngcc-icon>
      </div>
    `,
  }),
};

export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <ngcc-icon name="add" size="lg" color="red"></ngcc-icon>
        <ngcc-icon name="add" size="lg" color="green"></ngcc-icon>
        <ngcc-icon name="add" size="lg" color="blue"></ngcc-icon>
        <ngcc-icon name="add" size="lg" color="#ff9900"></ngcc-icon>
      </div>
    `,
  }),
};

export const Decorative: Story = {
  args: {
    name: 'close',
    size: 'lg',
    decorative: true,
  },
};

export const WithCustomClass: Story = {
  args: {
    name: 'edit',
    svgClass: 'custom-class',
  },
};
