'use strict';

var config = require('./config'),
    DependencyBundler = require('./bundler');

var bundler,
    filesToProcess = [];

var registration = function(mimosaConfig, register) {
  var js = mimosaConfig.extensions.javascript;

  var options = mimosaConfig.dependencyBundler;
  options.baseDir = mimosaConfig.watch.compiledJavascriptDir;
  options.logger = mimosaConfig.log;

  bundler = new DependencyBundler(options);

  // Build workflows
  register(['buildFile'], 'init', buildDependencies, js);
  register(['postBuild'], 'init', createBundles);

  // Watch workflows
  register(['add'], 'afterCompile', addDependencies, js);
  register(['remove'], 'afterDelete', removeDependencies, js);

  // Clean workflows
  register(['preClean'], 'init', deleteBundles);
};

function addDependencies(mimosaConfig, options, next) {
  bundler.processFiles(options.files);
  next();
}

function removeDependencies(mimosaConfig, options, next) {
  bundler.processDeletedFiles(options.files);
  next();
}

function buildDependencies(mimosaConfig, options, next) {
  options.files.forEach(function(file) {
    filesToProcess.push(file);
  });
  next();
}

function createBundles(mimosaConfig, options, next) {
  if (filesToProcess.length > 0) {
    bundler.processFiles(filesToProcess);
    filesToProcess = [];
  }
  next();
}

function deleteBundles(mimosaConfig, options, next) {
  bundler.clearBundles();
  next();
}

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};