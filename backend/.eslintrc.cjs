module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'standard'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    overrides: [
        {
            files: [
                '**/*.spec.tsx',
                '**/*.spec.ts',
            ],
            env: {
                jest: true
            }
        },
        {
            files: [
                '**/*.tsx',
            ],
            excludedFiles: [
                '**/*Page.tsx',
                '**/*Page.spec.ts',
                '**/*Page.spec.tsx',
            ]
        }
    ],
    settings: {},
    rules: {
        semi: ['error', 'always'],
        'space-before-function-paren': 0,
        'comma-dangle': ['error', 'only-multiline'],
        'no-trailing-spaces': 0,
        'padded-blocks': 0,
        'object-curly-spacing': ['warn', 'always'],
        '@typescript-eslint/no-use-before-define': ['error']
    }
};
