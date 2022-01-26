module.exports = {
    "env": {
        "commonjs": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "airbnb-base",
        "airbnb-typescript/base",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "prettier/@typescript-eslint"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
    }
}
