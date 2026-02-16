import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccModal } from './ngcc-modal';
import { NgccButton } from '../ngcc-button/ngcc-button';
import { NgccInput } from '../ngcc-input/ngcc-input-text/ngcc-input';
import { NgccCheckbox } from '../ngcc-checkbox/ngcc-checkbox';

class ModalStoryWrapper {
  open = false;

  title = 'Example Modal';
  variant: 'default' | 'danger' | 'passive' = 'default';
  size: 'sm' | 'md' | 'lg' = 'md';

  primaryLabel: string | null = 'Confirm';
  secondaryLabel: string | null = 'Cancel';
  primaryDisabled = false;
  closeOnOverlayClick = true;

  onClose() {
    this.open = false;
  }

  onSubmit() {
    alert('Submitted!');
    this.open = false;
  }
}

const meta: Meta<ModalStoryWrapper> = {
  title: 'Components/Modal',
  component: ModalStoryWrapper,
  decorators: [
    moduleMetadata({
      imports: [NgccModal, NgccButton, NgccInput, NgccCheckbox],
    }),
  ],
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<ModalStoryWrapper>;

/** Default modal */
export const Default: Story = {
  args: {
    title: 'Default Modal',
    primaryLabel: 'Save',
    secondaryLabel: 'Cancel',
  },
  render: (args) => ({
    props: args,
    template: `
     <ngcc-button (click)="open = true" label="Open Modal"></ngcc-button>

    <ngcc-modal
      [(open)]="open"
      [title]="title"
      [variant]="variant"
      [size]="size"
      [primaryLabel]="primaryLabel"
      [secondaryLabel]="secondaryLabel"
      [primaryDisabled]="primaryDisabled"
      [closeOnOverlayClick]="closeOnOverlayClick"
      (closed)="onClose()"
      (submitted)="onSubmit()"
    >
<p>
       Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repudiandae, molestiae similique nihil qui error obcaecati quos vero nulla voluptas ratione.
</p>
  </ngcc-modal>
    `,
  }),
};

/** Passive modal (informational only, no footer actions) */
export const Passive: Story = {
  args: {
    title: 'Information',
    variant: 'passive',
  },
  render: (args) => ({
    props: args,
    template: `
     <ngcc-button (click)="open = true" label="Open Passive Modal"></ngcc-button>

    <ngcc-modal
      [(open)]="open"
      [title]="title"
      [variant]="variant"
      [size]="size"
      [closeOnOverlayClick]="closeOnOverlayClick"
      (closed)="onClose()"
      (submitted)="onSubmit()"
    >
    <p>This is a passive modal with no footer actions. Used for read-only content.</p>
    </ngcc-modal>
    `,
  }),
};

/** Confirmation modal */
export const Confirmation: Story = {
  args: {
    title: 'Confirm Action',
    primaryLabel: 'Yes',
    secondaryLabel: 'No',
  },
  render: (args) => ({
    props: args,
    template: `
     <ngcc-button (click)="open = true" label="Open Confirmation Modal"></ngcc-button>

    <ngcc-modal
      [(open)]="open"
      [title]="title"
      [variant]="variant"
      [size]="size"
      [primaryLabel]="primaryLabel"
      [secondaryLabel]="secondaryLabel"
      [primaryDisabled]="primaryDisabled"
      [closeOnOverlayClick]="closeOnOverlayClick"
      (closed)="onClose()"
      (submitted)="onSubmit()"
    >
           <p>Are you sure you want to continue?</p>
 </ngcc-modal>
    `,
  }),
};

/** Danger delete modal */
export const Delete: Story = {
  args: {
    title: 'Delete Item',
    variant: 'danger',
    primaryLabel: 'Delete',
    secondaryLabel: 'Cancel',
  },
  render: (args) => ({
    props: args,
    template: `
 <ngcc-button (click)="open = true" label="Open Delete Modal"></ngcc-button>

    <ngcc-modal
      [(open)]="open"
      [title]="title"
      [variant]="variant"
      [size]="size"
      [primaryLabel]="primaryLabel"
      [secondaryLabel]="secondaryLabel"
      [primaryDisabled]="primaryDisabled"
      [closeOnOverlayClick]="closeOnOverlayClick"
      (closed)="onClose()"
      (submitted)="onSubmit()"
    >
                 <p>This action cannot be undone. Do you want to proceed?</p>

 </ngcc-modal>
    `,
  }),
};

/** Delete modal with checkbox confirmation */
export const DeleteWithCheckbox: Story = {
  args: {
    title: 'Delete Project',
    variant: 'danger',
    primaryLabel: 'Delete',
    secondaryLabel: 'Cancel',
    primaryDisabled: true, // default disabled
  },
  render: (args) => ({
    props: {
      ...args,
      open: false,
      primaryDisabled: true,
      onClose: () => ({}),
      onSubmit: () => ({}),
      onCheckboxChange(checked: boolean) {
        this['primaryDisabled'] = !checked;
      },
    },
    template: `
      <ngcc-button (click)="open = true" label="Open Delete Modal with Checkbox"></ngcc-button>

      <ngcc-modal
        [(open)]="open"
        [title]="title"
        [variant]="variant"
        [size]="size"
        [primaryLabel]="primaryLabel"
        [secondaryLabel]="secondaryLabel"
        [primaryDisabled]="primaryDisabled"
        [closeOnOverlayClick]="closeOnOverlayClick"
        (closed)="onClose()"
        (submitted)="onSubmit()"
      >
        <p>Please confirm by selecting the checkbox below:</p>
        <ngcc-checkbox
          label="I understand this action cannot be undone"
          (checkedChange)="onCheckboxChange($event)">
        </ngcc-checkbox>
      </ngcc-modal>
    `,
  }),
};

/** Confirmation modal with text input */
export const ConfirmationWithInput: Story = {
  args: {
    title: 'Confirm Deletion',
    variant: 'danger',
    primaryLabel: 'Delete',
    secondaryLabel: 'Cancel',
    primaryDisabled: true, // default disabled
  },
  render: (args) => ({
    props: {
      ...args,
      open: false,
      inputValue: '',
      primaryDisabled: true,
      onClose: () => ({}),
      onSubmit: () => ({}),
      onInputChange(value: string) {
        this['primaryDisabled'] = value.trim() !== 'DELETE';
      },
    },
    template: `
      <ngcc-button (click)="open = true" label="Open Delete Modal with Text Input"></ngcc-button>

      <ngcc-modal
        [(open)]="open"
        [title]="title"
        [variant]="variant"
        [size]="size"
        [primaryLabel]="primaryLabel"
        [secondaryLabel]="secondaryLabel"
        [primaryDisabled]="primaryDisabled"
        [closeOnOverlayClick]="closeOnOverlayClick"
        (closed)="onClose()"
        (submitted)="onSubmit()"
      >
        <p>Type <b>DELETE</b> to confirm:</p>
        <br/>
        <ngcc-input
          placeholder="Type DELETE (case sensitive)"
          (valueChange)="onInputChange($event)">
        </ngcc-input>
      </ngcc-modal>
    `,
  }),
};

/** Small modal */
export const Small: Story = {
  args: {
    size: 'sm',
    title: 'Small Modal',
    primaryLabel: 'Yes',
    secondaryLabel: 'No',
  },
  render: (args) => ({
    props: args,
    template: `
     <ngcc-button (click)="open = true" label="Open Small Modal"></ngcc-button>

    <ngcc-modal
      [(open)]="open"
      [title]="title"
      [variant]="variant"
      [size]="size"
      [primaryLabel]="primaryLabel"
      [secondaryLabel]="secondaryLabel"
      [primaryDisabled]="primaryDisabled"
      [closeOnOverlayClick]="closeOnOverlayClick"
      (closed)="onClose()"
      (submitted)="onSubmit()"
    >
       <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repudiandae, molestiae similique nihil qui error obcaecati quos vero nulla voluptas ratione.
</p>
         </ngcc-modal>
    `,
  }),
};

/** Large modal */
export const Large: Story = {
  args: {
    size: 'lg',
    title: 'Large Modal',
    primaryLabel: 'Yes',
    secondaryLabel: 'No',
  },
  render: (args) => ({
    props: args,
    template: `
     <ngcc-button (click)="open = true" label="Open Large Modal"></ngcc-button>

    <ngcc-modal
      [(open)]="open"
      [title]="title"
      [variant]="variant"
      [size]="size"
      [primaryLabel]="primaryLabel"
      [secondaryLabel]="secondaryLabel"
      [primaryDisabled]="primaryDisabled"
      [closeOnOverlayClick]="closeOnOverlayClick"
      (closed)="onClose()"
      (submitted)="onSubmit()"
    >
<p>
       Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repudiandae, molestiae similique nihil qui error obcaecati quos vero nulla voluptas ratione.
</p>
         </ngcc-modal>
    `,
  }),
};
