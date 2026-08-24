import js from '@eslint/js'

export default [
  { ignores: ['dist/**'] },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
      },
    },
  },
]
