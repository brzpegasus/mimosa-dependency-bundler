var expect = require('chai').expect,
    DependencyBundler = require('../lib/bundler').DependencyBundler;

describe('DependencyBundler', function() {
  var bundler, fooBundle, barBundle,
      bundlerConfig = {
        bundles: [
          {
            name: 'foo.js',
            dependencies: ['/foo/1/', '/foo/2', 'app/common/']
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

  describe('clearBundles', function() {
    beforeEach(function() {
      fooBundle.push('app/foo1/a.js', 'app/foo2/a.js');
      barBundle.push('app/bar/a.js', 'app/bar/b.js', 'app/bar/c.js');
    });

    it('clears the list of dependencies for all bundles', function() {
      expect(fooBundle).to.have.length(2);
      expect(barBundle).to.have.length(3);

      bundler.clearBundles();
      fooBundle = bundler.getBundle('foo.js');
      barBundle = bundler.getBundle('bar.js');

      expect(fooBundle).to.have.length(0);
      expect(barBundle).to.have.length(0);
    });
  });

  describe('processFile', function() {
    it('adds a file to the list of dependencies for the matching bundle', function() {
      var filename;

      expect(fooBundle).to.have.length(0);
      expect(barBundle).to.have.length(0);

      filename = 'app/foo/1/a.js';
      bundler.processFile(filename);
      expect(fooBundle).to.contain(filename);
      expect(barBundle).to.not.contain(filename);

      filename = 'app/bar/a.js';
      bundler.processFile(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.contain(filename);

      filename = 'app/bar.js';
      bundler.processFile(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.not.contain(filename);

      filename = 'app/bar_test.js';
      bundler.processFile(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.contain(filename);

      filename = 'app/common/shared.js';
      bundler.processFile(filename);
      expect(fooBundle).to.contain(filename);
      expect(barBundle).to.contain(filename);

      filename = 'a.js';
      bundler.processFile(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.not.contain(filename);
    });
  });

  describe('processDeletedFile', function() {
    beforeEach(function() {
      fooBundle.push('app/foo/a.js', 'app/common/shared.js');
      barBundle.push('/bar/1/a.js', 'app/common/shared.js');
    });

    it('deletes a file from the list of dependencies for the matching bundle', function() {
      var filename;

      filename = 'app/foo/a.js';
      bundler.processDeletedFile(filename);
      expect(fooBundle).to.not.contain(filename);

      filename = 'app/common/shared.js';
      bundler.processDeletedFile(filename);
      expect(fooBundle).to.not.contain(filename);
      expect(barBundle).to.not.contain(filename);
    });
  });
});
