module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'plugin:react/recommended',
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
        'react',
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
    settings: {
        react: {
            version: 'detect'
        }
    },
    rules: {
        semi: ['error', 'always'],
        'space-before-function-paren': 0,
        'comma-dangle': ['error', 'only-multiline'],
        'no-trailing-spaces': 0,
        'padded-blocks': 0,
        'object-curly-spacing': ['warn', 'always'],
        '@typescript-eslint/no-use-before-define': ['error'],
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'react/react-in-jsx-scope': 0,
        'react/function-component-definition': ['warn', {
            namedComponents: ['function-declaration'],
            unnamedComponents: ['function-expression', 'arrow-function']
        }],
        'react/jsx-max-props-per-line': ['error', {maximum: {single: 1, multi: 2}}],
        'react/jsx-closing-bracket-location': ['warn', 'tag-aligned'],
        'react/jsx-closing-tag-location': 'error',
        'react/jsx-first-prop-new-line': ['error', 'multiline'],
        'react/jsx-indent-props': ['error', 4]
    }
};
