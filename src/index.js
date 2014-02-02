'use strict';

var fs = require('fs'),
    path = require('path'),
    config = require('./config'),
    logger = require('logmimosa');

var bundler;

var registration = function(mimosaConfig, register) {
  var jsExt = mimosaConfig.extensions.javascript,
      bundlerConfig = mimosaConfig.dependencyBundler;

  var DependencyBundler = require('./bundler').DependencyBundler;
  bundler = new DependencyBundler(bundlerConfig);

  register(['add', 'update'], 'afterCompile', _buildDependencies, jsExt);
  register(['remove'], 'afterDelete', _removeDependencies, jsExt);
  register(['buildFile'], 'init', _buildDependencies, jsExt);

  register(['add','update'], 'afterWrite', _writeBundles, jsExt);
  register(['remove'], 'afterWrite', _writeBundles, jsExt);
  register(['postBuild'], 'init', _writeBundles);

  register(['preClean'], 'init', _deleteBundles);
};

function _buildDependencies(mimosaConfig, options, next) {
  options.files.forEach(function(file) {
    bundler.processFile(file.outputFileName);
  });
  next();
}

function _removeDependencies(mimosaConfig, options, next) {
  options.files.forEach(function(file) {
    bundler.processDeletedFile(file.outputFileName);
  });
  next();
}

function _writeBundles(mimosaConfig, options, next) {
  var baseDir = mimosaConfig.watch.compiledJavascriptDir;

  bundler.bundleNames.forEach(function(name) {
    var filename = path.resolve(baseDir, name),
        dependencies = bundler.getBundle(name);
    var modules = dependencies.map(function(dep) {
      return "  '" + path.relative(baseDir, dep).replace(/\.js$/, '').split(path.sep).join('/') + "'";
    });
    fs.writeFileSync(filename, 'define([\n' + modules.sort().join(',\n') + '\n]);');
  });

  next();
}

function _deleteBundles(mimosaConfig, options, next) {
  var baseDir = mimosaConfig.watch.compiledJavascriptDir;

  bundler.bundleNames.forEach(function(name) {
    var filename = path.resolve(baseDir, name);
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
  });
  bundler.clearBundles();

  next();
}

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};