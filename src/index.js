'use strict';

var config = require('./config');
var bundler, targetDir;

var registration = function(mimosaConfig, register) {
  var jsExt = mimosaConfig.extensions.javascript,
      bundlerConfig = mimosaConfig.dependencyBundler;

  var DependencyBundler = require('./bundler').DependencyBundler;
  bundler = new DependencyBundler(bundlerConfig);

  targetDir = mimosaConfig.watch.compiledJavascriptDir;

  register(['add'], 'afterCompile', _buildDependencies, jsExt);
  register(['remove'], 'afterDelete', _removeDependencies, jsExt);

  register(['buildFile'], 'init', _buildDependencies, jsExt);
  register(['postBuild'], 'init', _writeBundles);

  register(['preClean'], 'init', _deleteBundles);
};

function _buildDependencies(mimosaConfig, options, next) {
  options.files.forEach(function(file) {
    bundler.bundleNames.forEach(function(name) {
      var added = bundler.addToBundle(name, file.outputFileName);
      if (added && options.lifeCycleType === 'add') {
        bundler.writeBundleFile(name, targetDir);
      }
    });
  });
  next();
}

function _removeDependencies(mimosaConfig, options, next) {
  options.files.forEach(function(file) {
    bundler.bundleNames.forEach(function(name) {
      if (bundler.removeFromBundle(name, file.outputFileName)) {
        bundler.writeBundleFile(name, targetDir);
      }
    });
  });
  next();
}

function _writeBundles(mimosaConfig, options, next) {
  bundler.bundleNames.forEach(function(name) {
    bundler.writeBundleFile(name, targetDir);
  });
  next();
}

function _deleteBundles(mimosaConfig, options, next) {
  bundler.bundleNames.forEach(function(name) {
    bundler.deleteBundleFile(name, targetDir);
    bundler.clearBundle(name);
  });
  next();
}

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};