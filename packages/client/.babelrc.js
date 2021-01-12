const plugins = [
  [
    'babel-plugin-transform-imports',
    {
      '@material-ui/core': {
        // Use "transform: '@material-ui/core/${member}'," if your bundler does not support ES modules
        transform: '@material-ui/core/esm/${member}',
        preventFullImport: true,
      },
      '@material-ui/icons': {
        // Use "transform: '@material-ui/icons/${member}'," if your bundler does not support ES modules
        transform: '@material-ui/icons/esm/${member}',
        preventFullImport: true,
      },
      '@material-ui/lab': {
        transform: '@material-ui/lab/esm/${member}',
        preventFullImport: true,
      },
      'react-bootstrap': {
        transform: 'react-bootstrap/esm/${member}',
        preventFullImport: true,
      },
      lodash: {
        transform: 'lodash/${member}',
        preventFullImport: true,
      },
    },
  ],
  ['@babel/plugin-proposal-optional-chaining'],
];

module.exports = { plugins };
