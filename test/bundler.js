var fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    config = require('./fixtures/config').config,
    DependencyBundler = require('../lib/bundler');

function loadFiles(dir) {
  var files = [];
  fs.readdirSync(dir).forEach(function(file) {
    file = path.resolve(dir, file);
    var stats = fs.statSync(file);
    if (stats.isDirectory()) {
      files = files.concat(loadFiles(file));
    } else {
      files.push(file);
    }
  });
  return files;
}

function content(file) {
  return fs.readFileSync(file, 'utf8');
}

describe('DependencyBundler', function() {
  var bundler,
      fixturesDir = 'test/fixtures',
      expectedDir = 'test/expected',
      actualDir = 'test/actual';

  // Suppress logging for testing
  var logger = {};
  logger.error = logger.warn = logger.info = logger.debug = function() {};

  before(function() {
    var options = config.dependencyBundler;
    options.baseDir = actualDir;
    options.logger = logger;

    bundler = new DependencyBundler(options);

    // Create the compiled directory
    if (!fs.existsSync(actualDir)) {
      fs.mkdirSync(actualDir);
    }
  });

  after(function() {
    // Clean up the compiled directory
    if (fs.existsSync(actualDir)) {
      loadFiles(actualDir).forEach(function(file) {
        fs.unlinkSync(file);
      });
      fs.rmdirSync(actualDir);
    }
  });

  describe("processFiles", function() {
    var foo = path.resolve(expectedDir, 'processFiles', 'foo.js'),
        bar = path.resolve(expectedDir, 'processFiles', 'bar.js'),
        inputFiles;

    before(function() {
      inputFiles = loadFiles(fixturesDir).map(function(file) {
        return { outputFileName: file.replace('fixtures', 'actual') };
      });
    });

    it("adds files to their matching bundles", function() {
      bundler.processFiles(inputFiles);

      var actualFoo = path.resolve(actualDir, 'foo.js');
      expect(fs.existsSync(actualFoo)).to.be.true;
      expect(content(actualFoo)).to.equal(content(foo));

      var actualBar = path.resolve(actualDir, 'bar.js');
      expect(fs.existsSync(actualBar)).to.be.true;
      expect(content(actualBar)).to.equal(content(bar));
    });   
  });

  describe("processDeletedFiles", function() {
    var foo = path.resolve(expectedDir, 'processDeletedFiles', 'foo.js'),
        bar = path.resolve(expectedDir, 'processDeletedFiles', 'bar.js'),
        inputFiles;

    before(function() {
      inputFiles = [
        path.resolve(fixturesDir, 'app/common/shared.js'),
        path.resolve(fixturesDir, 'app/bar/_d.js')
      ].map(function(file) {
        return { outputFileName: file.replace('fixtures', 'actual') };
      });
    });

    it("removes files from their matching bundles", function() {
      bundler.processDeletedFiles(inputFiles);

      var actualFoo = path.resolve(actualDir, 'foo.js');
      expect(fs.existsSync(actualFoo)).to.be.true;
      expect(content(actualFoo)).to.equal(content(foo));

      var actualBar = path.resolve(actualDir, 'bar.js');
      expect(fs.existsSync(actualBar)).to.be.true;
      expect(content(actualBar)).to.equal(content(bar));
    });
  });

  describe("clearBundles", function() {
    it("deletes all bundle files", function() {
      bundler.clearBundles();

      var foo = path.resolve(actualDir, 'foo.js');
      expect(fs.existsSync(foo)).to.be.false;

      var bar = path.resolve(actualDir, 'bar.js');
      expect(fs.existsSync(bar)).to.be.false;
    });
  });
});