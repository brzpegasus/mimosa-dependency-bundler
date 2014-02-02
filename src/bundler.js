'use strict';

function fileMatch(filename, patterns) {
  return patterns.some(function(pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(filename);
    } else {
      filename = filename.replace(/\\/g, '/');
      pattern = pattern.replace(/\\/g, '/');
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
    patterns[bundle.name] = bundle.dependencies;
  });

  this.bundles = bundles;
  this.bundleNames = Object.keys(bundles);
  this.patterns = patterns;
};

DependencyBundler.prototype.getBundle = function(name) {
  return this.bundles[name];
};

DependencyBundler.prototype.clearBundles = function() {
  this.bundleNames.forEach(function(name) {
    this.bundles[name] = [];
  }, this);
};

DependencyBundler.prototype.processFile = function(filename) {
  this.bundleNames.forEach(function(name) {
    if (fileMatch(filename, this.patterns[name])) {
      if (this.bundles[name].indexOf(filename) < 0) {
        this.bundles[name].push(filename);
      }
    }
  }, this);
};

DependencyBundler.prototype.processDeletedFile = function(filename) {
  this.bundleNames.forEach(function(name) {
    var idx, dependencies = this.bundles[name];
    if ((idx = dependencies.indexOf(filename)) > -1) {
      dependencies.splice(idx, 1);
    }
  }, this);
};

exports.DependencyBundler = DependencyBundler;
