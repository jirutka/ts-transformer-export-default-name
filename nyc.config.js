module.exports = {
  all: true,
  exclude: [
    'test/**',
  ],
  extension: [
    '.ts',
  ],
  include: [
    'src/**/*.ts',
  ],
  require: [
    'ts-node/register',
  ],
  reporter: [
    'html',
    'lcov',
    'text',
  ],
  'temp-dir': '.tmp/nyc',
}
