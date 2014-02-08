'use strict';

var fs = require('fs'),
    path = require('path'),
    util = require('./util');

var logger;

/**
  DependencyBundler manages one or more "bundles" of
  AMD module dependencies.
  @constructor
  @class DependencyBundler
  @param {Object} options
*/
var DependencyBundler = function(options) {
  options = options || {};

  var bundles = [],
      bundleConfig = options.bundles || [],
      baseDir = options.baseDir || __dirname;

  bundleConfig.forEach(function(bundle) {
    var exclude = bundle.exclude || [];
    bundles.push({
      filename: path.resolve(baseDir, bundle.name),
      patterns: bundle.dependencies.map(util.normalizePattern),
      exclude: exclude.map(util.normalizePattern),
      dependencies: []
    });
  });

  this.bundles = bundles;
  this.baseDir = baseDir;

  logger = this.logger = options.logger;
};

/**
  Processes a group of files based on the filename patterns
  and adds them to the matching bundles.
  @param {Array} files
*/
DependencyBundler.prototype.processFiles = function(files) {
  var baseDir = this.baseDir;

  this.bundles.forEach(function(bundle) {
    var patterns = bundle.patterns,
        exclude = bundle.exclude,
        dependencies = bundle.dependencies,
        dirty = false;

    files.forEach(function(file) {
      var filename = util.normalizePath(file.outputFileName);

      if (!util.patternMatch(filename, exclude) &&
           util.patternMatch(filename, patterns)) {

        var dep = path.relative(baseDir, file.outputFileName);
        if (dependencies.indexOf(dep) < 0) {
          dependencies.push(dep);
          // If outputFileText is null, the file was most likely already
          // processed and included in the bundle file. We just needed to
          // reload it into the cache.
          if (file.outputFileText !== null) {
            dirty = true;
          }
        }
      }
    });

    if (dirty) {
      writeBundleFile(bundle);
    }
  });
};

/**
  Deletes the specified files from any of the bundles they exist in.
  @param {Array} files
*/
DependencyBundler.prototype.processDeletedFiles = function(files) {
  var baseDir = this.baseDir;

  this.bundles.forEach(function(bundle) {
    var dependencies = bundle.dependencies,
        dirty = false;

    files.forEach(function(file) {
      var idx, dep = path.relative(baseDir, file.outputFileName);
      if ((idx = dependencies.indexOf(dep)) > -1) {
        dependencies.splice(idx, 1);
        dirty = true;
      }
    });

    if (dirty) {
      writeBundleFile(bundle);
    }
  });
};

/**
  Clears all bundles of their dependencies.
*/
DependencyBundler.prototype.clearBundles = function() {
  this.bundles.forEach(function(bundle) {
    bundle.dependencies = [];
    deleteBundleFile(bundle);
  });
};

function writeBundleFile(bundle) {
  var deps = bundle.dependencies.map(function(dep) {
    return "  '" + util.fileNameToModuleId(dep) + "'";
  });
  fs.writeFileSync(bundle.filename, 'define([\n' + deps.sort().join(',\n') + '\n]);');
  logger.info("[dependency-bundler] Created file [[ " + bundle.filename + " ]]");
}

function deleteBundleFile(bundle) {
  if (fs.existsSync(bundle.filename)) {
    fs.unlinkSync(bundle.filename);
    logger.info("[dependency-bundler] Deleted file [[ " + bundle.filename + " ]]");
  }
}

module.exports = DependencyBundler;