export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting (no code change)
        'refactor', // Code restructuring
        'perf', // Performance improvement
        'test', // Adding/updating tests
        'build', // Build system or dependencies
        'ci', // CI/CD changes
        'chore', // Maintenance tasks
        'revert', // Revert a previous commit
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 100],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
  prompt: {
    useEmoji: false,
    scopes: [
      'button',
      'checkbox',
      'datepicker',
      'dropdown',
      'input',
      'textarea',
      'tabs',
      'accordion',
      'table',
      'pagination',
      'toast',
      'notification',
      'modal',
      'tooltip',
      'skeleton',
      'charts',
      'icons',
      'i18n',
      'theme',
    ],
    allowCustomScopes: true,
    types: [
      { value: 'feat', name: 'feat:     A new feature', emoji: '' },
      { value: 'fix', name: 'fix:      A bug fix', emoji: '' },
      { value: 'docs', name: 'docs:     Documentation only changes', emoji: '' },
      { value: 'style', name: 'style:    Formatting, no code change', emoji: '' },
      { value: 'refactor', name: 'refactor: Code restructuring (no feat/fix)', emoji: '' },
      { value: 'perf', name: 'perf:     Performance improvement', emoji: '' },
      { value: 'test', name: 'test:     Adding or updating tests', emoji: '' },
      { value: 'build', name: 'build:    Build system or dependencies', emoji: '' },
      { value: 'ci', name: 'ci:       CI/CD changes', emoji: '' },
      { value: 'chore', name: 'chore:    Maintenance tasks', emoji: '' },
      { value: 'revert', name: 'revert:   Revert a previous commit', emoji: '' },
    ],
  },
};
