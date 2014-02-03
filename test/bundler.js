var expect = require('chai').expect,
    DependencyBundler = require('../lib/bundler').DependencyBundler;

describe('DependencyBundler', function() {
  var bundler, fooBundle, barBundle,
      bundlerConfig = {
        bundles: [
          {
            name: 'foo.js',
            dependencies: ['/foo/1/', '/foo/2', 'app\\common\\']
          },
          {
            name: 'bar.js',
            dependencies: ['/bar/', 'app/common', /^app\/bar_.+\.js/]
          }
        ]
      };

  beforeEach(function() {
    bundler = new DependencyBundler(bundlerConfig);
    fooBundle = bundler.getBundle('foo.js');
    barBundle = bundler.getBundle('bar.js');
  });

  it('maintains a list of dependencies for each bundle specified in the config', function() {
    expect(fooBundle).to.be.instanceof(Array);
    expect(barBundle).to.be.instanceof(Array);
    expect(bundler.getBundle('baz.js')).to.not.exist;
  });

  describe('clearBundle', function() {
    it('clears the list of dependencies for the specified bundle', function() {
      fooBundle.push('app/foo1/a.js', 'app/foo2/a.js');
      expect(bundler.getBundle('foo.js')).to.have.length(2);

      bundler.clearBundle('foo.js');
      expect(bundler.getBundle('foo.js')).to.have.length(0);
    });
  });

  describe('addToBundle', function() {
    it('adds a dependency to the bundle if the it matches the filter criteria', function() {
      var filename;
      var addToBundles = function(name) {
        bundler.addToBundle('foo.js', name);
        bundler.addToBundle('bar.js', name);
      };

      filename = 'app/foo/1/a.js';
      addToBundles(filename);
      expect(fooBundle).to.contain(filename);
      expect(barBundle).to.not.contain(filename);

      filename = 'app/bar/a.js';
      addToBundles(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.contain(filename);

      filename = 'app/bar.js';
      addToBundles(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.not.contain(filename);

      filename = 'app/bar_test.js';
      addToBundles(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.contain(filename);

      filename = 'app\\bar_test2.js';
      addToBundles(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.contain(filename);

      filename = 'app\\common\\shared.js';
      addToBundles(filename);
      expect(fooBundle).to.contain(filename);
      expect(barBundle).to.contain(filename);

      filename = 'a.js';
      addToBundles(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.not.contain(filename);
    });
  });

  describe('removeFromBundle', function() {
    before(function() {
      fooBundle.push('app/foo/a.js', 'app/common/shared.js');
      barBundle.push('/bar/1/a.js', 'app/common/shared.js');
    });

    it('deletes a file from the list of dependencies for the matching bundle', function() {
      var filename;

      filename = 'app/foo/a.js';
      bundler.removeFromBundle('foo.js', filename);
      expect(fooBundle).to.not.contain(filename);

      filename = 'app/common/shared.js';
      bundler.removeFromBundle('foo.js', filename);
      bundler.removeFromBundle('bar.js', filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.not.contain(filename);
    });
  });
});
