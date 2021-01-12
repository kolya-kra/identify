// const { alias } = require('react-app-rewire-alias');
const { useBabelRc, addWebpackAlias, override } = require('customize-cra');
const path = require('path');

module.exports = override(
  useBabelRc(),
  addWebpackAlias({
    ['@lib']: path.resolve(__dirname, 'src/lib/'),
    ['@views']: path.resolve(__dirname, 'src/views/general/'),
    ['@personApp']: path.resolve(__dirname, 'src/views/person/'),
    ['@businessApp']: path.resolve(__dirname, 'src/views/business/'),
    ['@components']: path.resolve(__dirname, 'src/components/'),
    ['@icons']: path.resolve(__dirname, 'src/icons/'),
    ['@src']: path.resolve(__dirname, 'src/'),
  })
);
