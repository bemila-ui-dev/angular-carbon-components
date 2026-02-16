import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccButton } from './ngcc-button';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { ICONS, NgccIconNameType } from '../ngcc-icons/icons';

const meta: Meta<NgccButton> = {
  title: 'Components/Button',
  component: NgccButton,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgccButton, NgccIcon],
    }),
  ],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'primary',
        'secondary',
        'tertiary',
        'ghost',
        'danger',
        'danger_tertiary',
        'danger_ghost',
      ],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    iconName: {
      control: { type: 'select' },
      options: Object.keys(ICONS) as NgccIconNameType[],
    },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    expressive: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<NgccButton>;

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Add Item',
    variant: 'primary',
    iconName: 'add',
  },
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    variant: 'primary',
    iconName: 'add',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
};

export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 1rem;">
        <ngcc-button label="Small" size="sm" variant="primary"></ngcc-button>
        <ngcc-button label="Medium" size="md" variant="primary"></ngcc-button>
        <ngcc-button label="Large" size="lg" variant="primary"></ngcc-button>
      </div>
    `,
  }),
};

// export const CenteredText: Story = {
//   args: {
//     label: "custom-btn",
//     className: 'ngcc--btn'
//   }
// }

// export const ThemedButtons: Story = {
//   render: (args) => ({
//     props: args,
//     template: `
//       <div style="display: flex; gap: 1rem;">
//       <div data-carbon-theme="white">
//           <ngcc-button label="Carbon Default" variant="primary"></ngcc-button>
//         </div>
//         <div data-carbon-theme="rounded">
//           <ngcc-button label="Fully Curved" variant="primary"></ngcc-button>
//         </div>
//         <div data-carbon-theme="curved">
//           <ngcc-button label="Light Curves" variant="primary"></ngcc-button>
//         </div>
//         <div data-carbon-theme="centered">
//           <ngcc-button label="Text Centered with Light Curved" variant="primary"></ngcc-button>
//         </div>
//       </div>
//     `,
//   }),
// };
