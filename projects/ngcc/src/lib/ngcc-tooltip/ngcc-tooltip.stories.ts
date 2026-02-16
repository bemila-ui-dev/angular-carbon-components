import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgccTooltip } from './ngcc-tooltip';
import { NgccButton } from '../ngcc-button/ngcc-button';
import { Component } from '@angular/core';

const meta: Meta<NgccTooltip> = {
  title: 'Components/Tooltip',
  component: NgccTooltip,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgccTooltip, NgccButton],
    }),
  ],
  argTypes: {
    description: { control: 'text' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
    autoAlign: { control: 'boolean' },
    open: { control: 'boolean' },
    enterDelayMs: { control: 'number' },
    leaveDelayMs: { control: 'number' },
  },
};
export default meta;

type Story = StoryObj<NgccTooltip>;

/* --- 1. Basic Tooltip with Text --- */
export const Basic: Story = {
  args: {
    description: 'Simple tooltip text',
    placement: 'top',
    align: 'center',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="margin: 100px; display: flex; justify-content: center;">
        <ngcc-tooltip [description]="description" [placement]="placement" [align]="align">
          <ngcc-button label="Hover me"></ngcc-button>
        </ngcc-tooltip>
      </div>
    `,
  }),
};

/* --- 2. Tooltip with TemplateRef Content --- */
@Component({
  selector: 'storybook-tooltip-template',
  standalone: true,
  imports: [NgccTooltip, NgccButton],
  template: `
    <ng-template #customTpl>
      <div style="max-width: 200px;">
        <strong>Custom Tooltip</strong><br />
        With <em>formatted</em> text and <span style="color: red;">styles</span>.
      </div>
    </ng-template>

    <div style="margin: 100px; display: flex; justify-content: center;">
      <ngcc-tooltip [description]="customTpl" placement="bottom" align="start">
        <ngcc-button label="Hover for template"></ngcc-button>
      </ngcc-tooltip>
    </div>
  `,
})
class TooltipTemplateStory {}

/* --- 2. Tooltip with TemplateRef Content --- */
export const WithTemplate: Story = {
  render: (args) => ({
    props: args,
    imports: [NgccTooltip, NgccButton],
    template: `
      <ng-template #customTpl>
        <div style="max-width: 200px;">
          <strong>Custom Tooltip</strong><br />
          With <em>formatted</em> text and <span style="color: red;">styles</span>.
        </div>
      </ng-template>

      <div style="margin: 100px; display: flex; justify-content: center;">
        <ngcc-tooltip [description]="customTpl" placement="bottom" align="start">
          <ngcc-button label="Hover for template"></ngcc-button>
        </ngcc-tooltip>
      </div>
    `,
  }),
};

/* --- 3. Positioning and Alignment Demo --- */
export const Positioning: Story = {
  args: {
    description: 'Positioned tooltip',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 100px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 80px; justify-items: center;">
        <ngcc-tooltip [description]="description" placement="top" align="center">
          <ngcc-button label="Top Center"></ngcc-button>
        </ngcc-tooltip>

        <ngcc-tooltip [description]="description" placement="bottom" align="start">
          <ngcc-button label="Bottom Start"></ngcc-button>
        </ngcc-tooltip>

        <ngcc-tooltip [description]="description" placement="right" align="end">
          <ngcc-button label="Right End"></ngcc-button>
        </ngcc-tooltip>

        <ngcc-tooltip [description]="description" placement="left" align="center">
          <ngcc-button label="Left Center"></ngcc-button>
        </ngcc-tooltip>
      </div>
    `,
  }),
};

/* --- 4. Auto-align Near Edges --- */
export const AutoAlignEdge: Story = {
  args: {
    description: 'Auto-aligned tooltip',
    autoAlign: true,
  },
  render: (args) => ({
    props: args,
    template: `
    <div style="height:1000px">
			<div style="position: absolute; top: 200px; left: 200px;">
        <ngcc-tooltip [open]=true [description]="description" [autoAlign]="autoAlign" >
          <ngcc-button label="Near  edge"></ngcc-button>
        </ngcc-tooltip>
      </div>
    `,
  }),
};
