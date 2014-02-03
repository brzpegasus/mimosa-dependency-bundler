'use strict';

var fs = require('fs'),
    path = require('path'),
    logger = require('logmimosa');

function fileMatch(filename, patterns) {
  filename = filename.replace(/\\/g, '/');

  return patterns.some(function(pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(filename);
    } else {
      return filename.indexOf(pattern) > -1;
    }
  });
}

var DependencyBundler = function(options) {
  options = options || {};

  var bundles = {},
      patterns = {},
      bundleConfig = options.bundles || [];

  bundleConfig.forEach(function(bundle) {
    bundles[bundle.name] = [];
    patterns[bundle.name] = bundle.dependencies.map(function(pattern) {
      return (typeof pattern === 'string') ? pattern.replace(/\\/g, '/') : pattern;
    });
  });

  this.bundles = bundles;
  this.bundleNames = Object.keys(bundles);
  this.patterns = patterns;
};

DependencyBundler.prototype.getBundle = function(name) {
  return this.bundles[name];
};

DependencyBundler.prototype.clearBundle = function(name) {
  this.bundles[name] = [];
};

DependencyBundler.prototype.addToBundle = function(name, dependency) {
  var bundle = this.bundles[name];
  if (fileMatch(dependency, this.patterns[name])) {
    if (bundle.indexOf(dependency) < 0) {
      bundle.push(dependency);
      return true;
    }
  }
};

DependencyBundler.prototype.removeFromBundle = function(name, dependency) {
  var idx, bundle = this.bundles[name];
  if ((idx = bundle.indexOf(dependency)) > -1) {
    bundle.splice(idx, 1);
    return true;
  }
};

DependencyBundler.prototype.writeBundleFile = function(name, targetDir) {
  var filename = path.resolve(targetDir, name);
  var modules = this.bundles[name].map(function(dep) {
    return "  '" + path.relative(targetDir, dep).replace(/\.(.)+$/, '').split(path.sep).join('/') + "'";
  });
  fs.writeFileSync(filename, 'define([\n' + modules.sort().join(',\n') + '\n]);');
  logger.info("[dependency-bundle] Created file [[ " + filename + " ]]");
};

DependencyBundler.prototype.deleteBundleFile = function(name, targetDir) {
  var filename = path.resolve(targetDir, name);
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
    logger.info("[dependency-bundle] Deleted file [[ " + filename + " ]]");
  }
};

exports.DependencyBundler = DependencyBundler;
