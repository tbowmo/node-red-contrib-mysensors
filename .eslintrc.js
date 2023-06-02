module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    overrides: [
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'import',
        'import-newlines',
    ],
    root: true,
    rules: {
        'import/order': 'off',
        'eol-last': 'error',
        'comma-dangle': [
            'warn',
            'always-multiline',
        ],
        indent: [
            'error',
            4,
        ],
        'linebreak-style': [
            'error',
            'unix',
        ],
        quotes: [
            'warn',
            'single',
            { avoidEscape: true },
        ],
        semi: [
            'warn',
            'never',
        ],
        'max-len': [
            'error',
            {
                'code' : 180,
            },
        ],
        'no-console': [
            'warn',
        ],
        curly: [
            'error',
        ],
        eqeqeq: [
            'error',
        ],
        complexity: [
            'error',
            11,
        ],
        'import-newlines/enforce': [
            'error',
            {
                items: 2,
                'max-len': 180,
                semi: false,
            },
        ],

    },
}
