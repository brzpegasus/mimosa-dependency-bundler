exports.config = {
  dependencyBundler: {
    bundles: [
      {
        name: 'foo.js',
        dependencies: ['/foo/1/', 'app/common/']
      },
      {
        name: 'bar.js',
        dependencies: ['app/bar/', '/common/', /bar\/_.+\.js/],
        exclude: ['app/bar/excluded']
      }
    ]
  }
}