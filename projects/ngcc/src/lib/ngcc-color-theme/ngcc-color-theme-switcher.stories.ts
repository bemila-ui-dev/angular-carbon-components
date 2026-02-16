import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgccColorThemeSwitcher } from './ngcc-color-theme-switcher';
import { NgccColorThemeService } from './ngcc-color-theme.service';

const meta: Meta<NgccColorThemeSwitcher> = {
  title: 'Components/Color Theme Switcher',
  component: NgccColorThemeSwitcher,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      providers: [NgccColorThemeService],
    }),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### 🎨 NgccColorThemeSwitcher

The **NgccColorThemeSwitcher** lets you interactively customize your Carbon color palette:
- Select *primary* and *secondary* base colors
- Toggle between base Carbon themes (\`g10\`, \`g90\`, \`g100\`)
- Preview color shades in real-time

#### 🔧 How It Works
- The component uses the **ColorThemeService** with Angular **signals** for reactive theme updates.
- Color changes instantly apply via CSS variable overrides on \`document.documentElement\`.
- Persist your chosen palette by saving the theme configuration in your application settings.

#### 🧱 Usage
\`\`\`html
<ngcc-color-theme-switcher></ngcc-color-theme-switcher>
\`\`\`

#### 💡 Tip
You can combine this with **CarbonThemeService** for full theme & color control across your enterprise app.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<NgccColorThemeSwitcher>;

export const Default: Story = {
  name: 'Interactive Demo',
  render: () => ({
    template: `
      <div style="max-width: 800px; margin: 2rem auto; font-family: var(--cds-body-compact-01);">
        <ngcc-color-theme-switcher></ngcc-color-theme-switcher>
      </div>
    `,
  }),
};
