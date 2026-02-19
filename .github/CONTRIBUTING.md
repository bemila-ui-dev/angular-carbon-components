# Contributing to NGCC

Thank you for your interest in contributing to **NGCC** (Angular Carbon Components)! This guide covers everything you need to know — from setting up your environment to submitting a polished pull request.

> **Inspired by:** The [Carbon Design System](https://github.com/carbon-design-system/carbon) contributing guidelines.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Branching Strategy](#branching-strategy)
- [Creating a Pull Request](#creating-a-pull-request)
- [Issue Guidelines](#issue-guidelines)
- [License](#license)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive experience for everyone.

---

## Getting Started

### Prerequisites

| Tool     | Version   |
|----------|-----------|
| Node.js  | >= 20     |
| npm      | >= 10     |
| Git      | Latest    |

### First-Time Contributors

Look for issues labeled **`good first issue`** or **`help wanted`** — these are great starting points. Comment on the issue to let maintainers know you're working on it.

> **Two-week rule:** If a claimed issue has no PR activity within two weeks, it becomes available for others to pick up.

---

## Development Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/<your-username>/angular-carbon-components.git
cd angular-carbon-components

# 3. Add upstream remote
git remote add upstream https://github.com/assistanz/angular-carbon-components.git

# 4. Install dependencies (also sets up Husky git hooks)
npm install

# 5. Run Storybook for development
npm run storybook

# 6. Run full precheck (build + test + lint + audit)
npm run precheck

# 7. Build the library
npm run build:lib
```

### Useful Commands

| Command                  | Description                              |
|--------------------------|------------------------------------------|
| `npm run storybook`      | Start Storybook dev server               |
| `npm run build:lib`      | Build the library                        |
| `npm run test`           | Run unit tests                           |
| `npm run lint`           | Run ESLint + Prettier checks             |
| `npm run lint:fix`       | Auto-fix lint issues                     |
| `npm run precheck`       | Full validation (build + test + lint)    |
| `npm run commit`         | Interactive commit wizard                |

---

## Coding Standards

### Angular Conventions

This project follows the [Angular Style Guide](https://angular.dev/style-guide) with these additional requirements:

| Rule | Requirement |
|------|-------------|
| **Components** | Angular 20+ standalone components only |
| **Signals** | Use `input()`, `output()`, `signal()`, `computed()` — no decorators |
| **Change Detection** | `ChangeDetectionStrategy.OnPush` on all components |
| **Control Flow** | Native `@if`, `@for`, `@switch` — no structural directives (`*ngIf`, `*ngFor`) |
| **Forms** | Implement `ControlValueAccessor` for all form components |
| **Self-closing tags** | Use self-closing tags where possible (`<ngcc-icon />`) |

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| **Component selector** | `ngcc-` prefix, kebab-case | `ngcc-button`, `ngcc-dropdown` |
| **Directive selector** | `ngcc` prefix, camelCase | `ngccTooltip`, `ngccClickOutside` |
| **Interface** | `Ngcc` prefix, PascalCase | `NgccDropdownItem`, `NgccTableConfig` |
| **File names** | kebab-case with type suffix | `ngcc-button.component.ts`, `ngcc-button.component.spec.ts` |
| **SCSS files** | Component-scoped, kebab-case | `ngcc-button.component.scss` |

### TypeScript Rules

- **No `any`** — use proper types or generics (`@typescript-eslint/no-explicit-any: error`)
- **Explicit return types** on public methods (warned)
- **Use `const`** over `let`; never use `var`
- **Use `===`** for equality checks — no loose equality
- **No `console.log`** — only `console.warn` and `console.error` are allowed
- **Use interfaces** over type aliases (`consistent-type-definitions: interface`)
- **Object shorthand** is required

### Template Rules

- All images must have `alt` text
- Interactive elements must be keyboard-accessible
- ARIA attributes must be valid
- No positive `tabindex` values
- Template conditional complexity limited to 3

### Formatting (Prettier)

Formatting is enforced via Prettier with the following configuration:

| Setting | Value |
|---------|-------|
| Print width | 100 |
| Tab width | 2 spaces |
| Semicolons | Always |
| Quotes | Single quotes |
| Trailing commas | All |
| Arrow parens | Always |
| End of line | LF |

> Run `npm run lint:prettier:fix` to auto-format before committing.

### Accessibility (a11y)

All components **must** meet [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) standards:

- Include `vitest-axe` accessibility tests in every component spec file
- Provide proper ARIA labels, roles, and keyboard navigation
- Test with screen readers when applicable
- Ensure sufficient color contrast ratios (4.5:1 for text, 3:1 for UI)
- Support `prefers-reduced-motion` and `prefers-color-scheme`

### Component Structure

Each component should follow this file structure:

```
projects/ngcc/src/lib/ngcc-<name>/
├── ngcc-<name>.component.ts        # Component class
├── ngcc-<name>.component.html       # Template
├── ngcc-<name>.component.scss       # Styles
├── ngcc-<name>.component.spec.ts    # Unit + a11y tests
├── ngcc-<name>.stories.ts           # Storybook stories
└── index.ts                         # Public API barrel
```

---

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by **Husky + commitlint** on every commit.

### Quick Start: Interactive Helper

```bash
# Stage your changes, then use the wizard
git add .
npm run commit
```

### Manual Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Rules:**
- Header must be **fewer than 72 characters**
- Use **imperative, present tense**: "add" not "added" or "adds"
- Do **not** capitalize the first letter of the description
- Do **not** end the description with a period

### Commit Types

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

### Scope

Scope is optional but **encouraged**. Use the component name:

```
feat(button): add icon-only variant
fix(dropdown): close on escape key
test(table): add sort column tests
```

### Breaking Changes

Add `!` after the type or include `BREAKING CHANGE:` in the footer:

```
feat(dropdown)!: change selection API to use signals

BREAKING CHANGE: DropdownComponent.selected is now a signal instead of EventEmitter.
Migration: Replace (selected)="onSelect($event)" with [selected]="selectedSignal".
```

### What Happens on Each Commit

```
git commit
  ├── pre-commit hook  → runs lint-staged (ESLint + Prettier)
  └── commit-msg hook  → validates commit message format (commitlint)
```

If either hook fails, the commit is rejected with a clear error message. Fix the issue and try again.

---

## Branching Strategy

### Branch Naming

Use the format: `<type>/<short-description>`

| Type | Usage | Example |
|------|-------|---------|
| `feat/` | New features | `feat/radio-button` |
| `fix/` | Bug fixes | `fix/dropdown-escape-key` |
| `docs/` | Documentation | `docs/contributing-guide` |
| `refactor/` | Refactoring | `refactor/table-sort` |
| `test/` | Test updates | `test/modal-a11y` |
| `chore/` | Maintenance | `chore/update-deps` |

### Workflow

```bash
# 1. Sync with upstream
git fetch upstream
git checkout master
git merge upstream/master

# 2. Create a feature branch
git checkout -b feat/radio-button

# 3. Make changes, commit, push
npm run commit
git push origin feat/radio-button

# 4. Open a PR on GitHub against `master`
```

---

## Creating a Pull Request

### PR Title

Your PR title **must** follow conventional commit format — CI validates this automatically. The PR will be **squash-merged**, so the PR title becomes the commit message in `master`.

```
feat: add radio button component
fix(dropdown): keyboard navigation not closing on escape
docs: update contributing guide with coding standards
```

### PR Description Template

When you open a PR, fill out the template with:

1. **Issue reference** — Link the related issue (`Closes #123`)
2. **Changelog** — Describe what's New, Changed, or Removed
3. **Type of Change** — Check the appropriate box
4. **Checklist** — Confirm all quality gates

### PR Checklist

Before requesting a review, ensure:

- [ ] Code follows the project's [coding standards](#coding-standards)
- [ ] `npm run lint` passes with no issues
- [ ] Tests are added/updated for the changes
- [ ] All tests pass (`npm run test`)
- [ ] Library builds successfully (`npm run build:lib`)
- [ ] Accessibility verified (WCAG 2.1 AA) with `vitest-axe` tests
- [ ] Storybook story added or updated (if applicable)
- [ ] Documentation updated (if applicable)
- [ ] Reviewed every line of the diff before submitting
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge) for UI changes

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

### Review Process

1. At least **one maintainer review** is required
2. All CI checks must pass
3. Address all review comments before merging
4. PRs are **squash-merged** into `master`

---

## Developer Certificate of Origin (DCO)

This project requires all contributors to agree to the [Developer Certificate of Origin](https://developercertificate.org/) to certify that they have the right to submit their work under the project’s license.

### Option 1 — Sign off each commit (recommended)

Use the `-s` flag when committing:

```bash
git commit -s -m "feat(button): add icon-only variant"
```

This appends a `Signed-off-by` line to your commit:

```
Signed-off-by: Your Name <email@example.com>
```

To sign off all commits on a branch retroactively:

```bash
git rebase --signoff HEAD~<number-of-commits>
```

### Option 2 — Comment on the PR

If you forgot to sign off, the DCO bot will comment on your PR with instructions. Add the following comment to sign:

```
I have read the DCO document and I hereby sign the DCO.
```

The bot will record your agreement and mark the DCO check as passed.

> **Note:** A `NGCC_BOT_DCO` personal access token must be configured in the repository secrets for the bot to write back signatures.

## Issue Guidelines

### Before Opening an Issue

1. **Search existing issues** — your problem may already be reported
2. **Check closed issues** — it may have been resolved
3. **Reproduce the issue** — confirm it's not caused by your local setup

### Bug Reports

Use the **Bug Report** template and include:

| Field | Required | Description |
|-------|----------|-------------|
| Description | Yes | Clear, concise description of the bug |
| Steps to Reproduce | Yes | Numbered steps to trigger the bug |
| Expected Behavior | Yes | What should happen |
| Actual Behavior | Yes | What actually happens |
| NGCC Version | Yes | Version of `@assistanz-networks/ngcc` |
| Angular Version | Yes | Version of `@angular/core` |
| Browser | Yes | Browser name and version |
| OS | Yes | Operating system |
| Node.js Version | Yes | Node.js version |
| Screenshots/Logs | No | Visual evidence or error output |

### Feature Requests

Use the **Feature Request** template and include:

| Field | Required | Description |
|-------|----------|-------------|
| Problem | Yes | The limitation or pain point |
| Proposed Solution | Yes | Your suggested approach |
| Alternatives Considered | No | Other approaches you evaluated |
| Design Impact | No | Does this need new Carbon tokens or patterns? |
| Additional Context | No | Mockups, references, or examples |

### Issue Labels

| Label | Description |
|-------|-------------|
| `type: bug` | Something isn't working |
| `type: enhancement` | New feature or improvement |
| `type: docs` | Documentation improvement |
| `type: question` | Questions about usage |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention is needed |
| `status: needs triage` | Awaiting maintainer review |
| `priority: high` | Needs immediate attention |
| `priority: low` | Nice to have, not urgent |

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).
