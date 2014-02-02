var expect = require('chai').expect,
    config = require('../lib/config');

describe('config', function() {
  describe('defaults', function() {
    var defaultConfig = config.defaults();

    it('should define a `dependencyBundler` object', function() {
      expect(defaultConfig.dependencyBundler).to.exist;
    });

    it('should define an empty bundle list', function() {
      var bundles = defaultConfig.dependencyBundler.bundles;
      expect(bundles).to.be.instanceof(Array);
      expect(bundles).to.be.empty;
    });
  });
});
