import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import unusedImports from 'eslint-plugin-unused-imports';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import prettier from 'eslint-config-prettier';

const SOURCE = ['**/*.{ts,tsx}'];

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'src/generated/**',
      'eslint.config.mjs',
      'commitlint.config.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat['recommended-latest'],
  jsxA11y.flatConfigs.recommended,
  sonarjs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: SOURCE,
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    plugins: {
      'unused-imports': unusedImports,
      '@eslint-community/eslint-comments': eslintComments,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      '@eslint-community/eslint-comments/require-description': [
        'error',
        { ignore: ['eslint-enable'] },
      ],
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: false }],
      '@eslint-community/eslint-comments/no-duplicate-disable': 'error',
      '@eslint-community/eslint-comments/no-aggregating-enable': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 10,
        },
      ],

      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-statements': ['warn', 15],
      'max-params': ['warn', 4],
      'react/jsx-max-depth': ['warn', { max: 5 }],

      complexity: ['error', 8],
      'sonarjs/cognitive-complexity': ['error', 10],
      'max-depth': ['error', 2],

      'sonarjs/no-nested-conditional': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/no-redundant-boolean': 'error',

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-invariant-returns': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-redundant-assignments': 'error',
      'sonarjs/no-unused-collection': 'error',

      'sonarjs/no-small-switch': 'error',
      'sonarjs/max-switch-cases': ['error', 30],
      'sonarjs/no-nested-functions': 'error',
      'sonarjs/no-nested-template-literals': 'error',
      'sonarjs/no-parameter-reassignment': 'error',
      'sonarjs/no-selector-parameter': 'error',
      'sonarjs/array-callback-without-return': 'error',
      'sonarjs/no-commented-code': 'error',
      'sonarjs/todo-tag': 'error',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      'id-length': [
        'error',
        {
          min: 3,
          properties: 'never',
          exceptions: ['id', 'db', 'to', 'up', 'fn'],
        },
      ],

      'no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
    },
  },

  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: { 'no-magic-numbers': 'off', 'sonarjs/no-duplicate-string': 'off' },
  },
  {
    files: ['**/*.schema.ts'],
    rules: { 'no-magic-numbers': 'off' },
  },

  prettier,

  {
    files: SOURCE,
    rules: {
      curly: ['error', 'all'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'never', prev: 'import', next: 'import' },
        {
          blankLine: 'always',
          prev: '*',
          next: ['function', 'class', 'export'],
        },
        {
          blankLine: 'always',
          prev: ['function', 'class', 'export'],
          next: '*',
        },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        {
          blankLine: 'always',
          prev: '*',
          next: ['if', 'for', 'while', 'do', 'switch', 'try'],
        },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },
];
