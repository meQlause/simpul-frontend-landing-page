const ATTRIBUTION = [/^co-authored-by:/im, /^claude-session:/im, /generated (?:with|by) /i];

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'sr6-no-attribution': ({ raw }) => [
          !ATTRIBUTION.some((pattern) => pattern.test(raw ?? '')),
          'SR-6: no Co-Authored-By trailer, session link or "generated with" footer',
        ],
      },
    },
  ],
  rules: {
    'sr6-no-attribution': [2, 'always'],
    'subject-case': [0],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100],
  },
};
