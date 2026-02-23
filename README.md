# NGCC

An independent, community-driven Angular component library inspired by the [Carbon Design System](https://carbondesignsystem.com/).

> **Disclaimer:** This project is NOT affiliated with, endorsed by, or sponsored by IBM or the Carbon Design System team. "Carbon" is a trademark of IBM Corporation. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for full attribution.

## Features

- Angular 20+ with Signals, standalone components, and OnPush change detection
- WCAG 2.1 AA accessible — automated axe testing on every component
- Full reactive forms support (ControlValueAccessor) for Checkbox, Input, Dropdown
- Carbon Design System theming (white, g10, g90, g100) with dynamic brand color support
- Tree-shakeable (`sideEffects: false`)
- Zoneless-compatible

## Components

| Category | Components |
|---|---|
| Actions | Button, NgccBaseChart |
| Charts | NgccBaseChart |
| Forms | Input, Textarea, Checkbox, Dropdown, Datepicker |
| Data | Table, Pagination |
| Feedback | Notification, Toast, Modal, Tooltip, Skeleton |
| Navigation | Tabs, Accordion |
| Data Viz | Charts (Bar, Line, Donut, etc.), Gauge Chart |
| Theming | Theme Switcher, Color Theme Service |

## Installation

```bash
npm install @assistanz/ngcc @carbon/styles @carbon/charts scss
```

### Setup styles

Import Carbon styles in your global stylesheet or `angular.json`:

```scss
@use '@carbon/styles/scss/config' with (
  $use-flexbox-grid: true,
  $font-path: '@ibm/plex'
);

@use '@assistanz/ngcc/styles';
```


## Quick Start

```typescript
import { NgccButton, NgccInput, NgccCheckbox } from 'ngcc';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgccButton, NgccInput, NgccCheckbox],
  template: `
    <ngcc-input label="Email" placeholder="Enter email" [(value)]="email" />
    <ngcc-checkbox label="I agree to terms" [(checked)]="agreed" />
    <ngcc-button label="Submit" variant="primary" />
  `,
})
export class ExampleComponent {
  email = '';
  agreed = false;
}
```

## Documentation

Run Storybook locally for interactive component demos and API docs:

```bash
npm run storybook
```

## Development

```bash
# Install dependencies
npm install

# Run Storybook (dev)
npm run storybook

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build the library
ng build ngcc
```

## Compatibility

| Dependency | Version |
|---|---|
| Angular | ^20.0.0 |
| @carbon/styles | ^1.98.0 |
| @carbon/charts | ^1.27.0 (optional) |
| TypeScript | ~5.9 |

## License

[MIT](./LICENSE)

## Third-Party Notices

This project uses IBM's Carbon Design System packages under the Apache-2.0 license.
See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for details.

## Testing phase
