# Contributing to NGCC

Thank you for your interest in contributing to NGCC! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

- Search [existing issues](https://github.com/assistanz/angular-carbon-components/issues) before opening a new one.
- Use the bug report template and include:
  - Angular version
  - `ngcc` version
  - Steps to reproduce
  - Expected vs actual behavior

### Suggesting Features

- Open a [feature request issue](https://github.com/assistanz/angular-carbon-components/issues/new) describing the use case and expected behavior.

### Submitting Pull Requests

1. Fork the repository and create a branch from `master`.
2. Install dependencies: `npm install` (this also sets up git hooks automatically via Husky).
3. Make your changes following the guidelines below.
4. Add or update tests for your changes.
5. Commit using the interactive helper: `npm run commit`
6. Push your branch and open a pull request against `master`.
7. Ensure PR title follows conventional commit format (e.g., `feat: add radio component`).

> **Note:** CI will validate your PR title format. Your PR will be squash-merged, so the PR title becomes the commit message in `master`.

## Development Setup

```bash
# Clone your fork
git clone https://github.com/<your-username>/angular-carbon-components.git
cd angular-carbon-components

# Install dependencies (also sets up Husky git hooks)
npm install

# Run Storybook
npm run storybook

# Run Precheck (build + test + lint + audit)
npm run precheck

# Build the library
npm run build:lib
```

## Coding Guidelines

- Use Angular 20+ standalone components with signals (`input()`, `output()`, `signal()`, `computed()`).
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on all components.
- Follow the [Angular style guide](https://angular.dev/style-guide).
- Use native control flow (`@if`, `@for`, `@switch`) instead of structural directives.
- Implement `ControlValueAccessor` for form components.
- All components must meet WCAG 2.1 AA accessibility standards.
- Include `vitest-axe` accessibility tests in every component spec file.

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are enforced by Husky + commitlint on every commit.

### Quick Start: Use the Interactive Helper

```bash
# Stage your changes
git add .

# Use the interactive commit wizard (recommended)
npm run commit
```

This will walk you through:
```
? Select the type of change:     feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
? What is the scope? (optional):  button, dropdown, table, etc.
? Short description:              add keyboard navigation support
? Longer description? (optional): ...
? Breaking changes? (optional):   ...
```

### Manual Commits

You can also write commit messages manually. The format is:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(dropdown): add multi-select support` |
| `fix` | Bug fix | `fix(modal): prevent focus escaping trap` |
| `docs` | Documentation only | `docs: update accordion storybook examples` |
| `style` | Formatting, no logic change | `style: fix indentation in button template` |
| `refactor` | Code restructuring | `refactor(table): simplify sort logic` |
| `perf` | Performance improvement | `perf(dropdown): lazy-render option list` |
| `test` | Adding/updating tests | `test(checkbox): add a11y axe tests` |
| `build` | Build system or deps | `build: update angular to v21` |
| `ci` | CI/CD changes | `ci: add codecov upload step` |
| `chore` | Maintenance | `chore: update .gitignore` |
| `revert` | Revert previous commit | `revert: revert dropdown changes` |

**Scope** is optional but encouraged. Use the component name (e.g., `button`, `dropdown`, `table`, `i18n`).

**Breaking changes:** Add `!` after the type or `BREAKING CHANGE:` in the footer:
```
feat(dropdown)!: change selection API to use signals

BREAKING CHANGE: DropdownComponent.selected is now a signal instead of EventEmitter.
```

### What Happens on Each Commit

```
git commit
  ├── pre-commit hook  → runs lint (ESLint + Prettier)
  └── commit-msg hook  → validates commit message format
```

If either hook fails, the commit is rejected with a clear error message. Fix the issue and try again.

## Creating a Pull Request

### Step-by-Step Guide

```bash
# 1. Create a feature branch
git checkout -b feat/radio-button

# 2. Make your changes and stage them
git add projects/ngcc/src/lib/ngcc-radio/

# 3. Commit (interactive)
npm run commit

# 4. Push to your fork
git push origin feat/radio-button

# 5. Open a PR on GitHub against `master`
```

### PR Requirements

- **Title** must follow conventional commit format (validated by CI):
  - `feat: add radio button component`
  - `fix(dropdown): keyboard navigation not closing on escape`
- **Description** should use the PR template checklist
- All CI checks must pass (lint, test, build)
- At least one maintainer review required

### PR Labels (auto-applied)

Labels are automatically added based on files changed:

| Label | Trigger |
|-------|---------|
| `area: components` | Changes to `lib/**/*.ts` or `lib/**/*.html` |
| `area: styles` | Changes to `**/*.scss` |
| `area: tests` | Changes to `**/*.spec.ts` |
| `area: docs` | Changes to `*.md`, `*.mdx`, or stories |
| `area: ci` | Changes to `.github/**` |
| `area: storybook` | Changes to `.storybook/**` or story files |
| `area: i18n` | Changes to `ngcc-i18n/**` |
| `area: build` | Changes to `package.json`, `angular.json`, tsconfig |

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
