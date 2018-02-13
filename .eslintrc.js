// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // add your custom rules here
  rules: {
    'space-before-function-paren': 'off',
    'no-unused-vars': 'off',
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    semi: [0] // 分号结尾
  }
};
