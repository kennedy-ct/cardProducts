module.exports = {
    'env': {
        'browser': true,
        'es2021': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },
    'rules': {
        'semi': 'error', 'always',
        'quotes': 'error', 'single',
        'ident': 'error', 4,
        'common-spacing': 'error', {before: false, after: true},
    }
};
