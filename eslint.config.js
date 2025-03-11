"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_1 = __importDefault(require("@eslint/js"));
const typescript_eslint_1 = __importDefault(require("typescript-eslint"));
const eslint_plugin_js_1 = __importDefault(require("@stylistic/eslint-plugin-js"));
const eslint_plugin_ts_1 = __importDefault(require("@stylistic/eslint-plugin-ts"));
const eslint_plugin_n_1 = __importDefault(require("eslint-plugin-n"));
const eslint_plugin_prettier_1 = __importDefault(require("eslint-plugin-prettier"));
const eslint_config_prettier_1 = __importDefault(require("eslint-config-prettier"));
exports.default = typescript_eslint_1.default.config(js_1.default.configs.recommended, eslint_plugin_n_1.default.configs['flat/recommended-script'], ...typescript_eslint_1.default.configs.strictTypeChecked, ...typescript_eslint_1.default.configs.stylisticTypeChecked, eslint_config_prettier_1.default, {
    ignores: ['**/node_modules/*', '**/*.mjs', '**/*.js'],
}, {
    languageOptions: {
        parserOptions: {
            project: './tsconfig.json',
            warnOnUnsupportedTypeScriptVersion: false,
        },
    },
}, {
    plugins: {
        '@stylistic/js': eslint_plugin_js_1.default,
        '@stylistic/ts': eslint_plugin_ts_1.default,
        prettier: eslint_plugin_prettier_1.default,
    },
}, {
    files: ['**/*.ts'],
}, {
    rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
        '@typescript-eslint/restrict-plus-operands': ['warn', { allowNumberAndString: true }],
        '@typescript-eslint/explicit-member-accessibility': 'warn',
        '@typescript-eslint/no-misused-promises': 0,
        '@typescript-eslint/no-floating-promises': 0,
        '@typescript-eslint/no-confusing-void-expression': 0,
        '@typescript-eslint/no-unnecessary-condition': 0,
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-unsafe-enum-comparison': 0,
        '@typescript-eslint/no-unnecessary-type-parameters': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-unused-expressions': 'warn',
        '@stylistic/js/no-extra-semi': 'off',
        'max-len': 'off',
        '@stylistic/ts/semi': 'off',
        '@stylistic/ts/member-delimiter-style': 'off',
        'comma-dangle': 'off',
        indent: 'off',
        quotes: 'off',
        'n/no-process-env': 1,
        'n/no-missing-import': 0,
        'n/no-unpublished-import': 0,
        'prefer-const': 'warn',
        'no-console': 1,
        'no-extra-boolean-cast': 0,
    },
    ignores: ['**/node_modules/*', '**/*.mjs', '**/*.js', '**/*.hbs'],
});
