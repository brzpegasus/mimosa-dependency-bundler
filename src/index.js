'use strict';

var path = require('path'),
    fs = require('fs'),
    config = require('./config'),
    logger = require('logmimosa');

var deps = {},
    keys = Object.keys;

var registration = function(mimosaConfig, register) {
  var jsExt = mimosaConfig.extensions.javascript;

  register(['add', 'update'], 'afterCompile', _buildDeps, jsExt);
  register(['remove'], 'afterDelete', _removeDeps, jsExt);
  register(['buildFile'], 'init', _buildDeps, jsExt);

  register(['add','update'], 'afterWrite', _writeDeps, jsExt);
  register(['remove'], 'afterWrite', _writeDeps, jsExt);
  register(['postBuild'], 'init', _writeDeps);

  register(['preClean'], 'init', _destroyDeps);
};

function _buildDeps(mimosaConfig, options, next) {
  var depsConfig = mimosaConfig.requireDeps && mimosaConfig.requireDeps.deps || {};

  keys(depsConfig).forEach(function(name) {
    var depFiles = deps[name] = deps[name] || [],
        depRegex = depsConfig[name];

    options.files.forEach(function(file) {
      var filename = file.outputFileName;
      if (depRegex.test(filename)) {
        if (depFiles.indexOf(filename) < 0) {
          depFiles.push(filename);
        }
      }
    });
  });

  next();
}

function _removeDeps(mimosaConfig, options, next) {
  options.files.forEach(function(file) {
    var idx, filename = file.outputFileName;
    keys(deps).forEach(function(name) {
      if ((idx = deps[name].indexOf(filename)) > -1) {
        deps[name].splice(idx, 1);
      }
    });
  });

  next();
}

function _writeDeps(mimosaConfig, options, next) {
  var jsDir = mimosaConfig.watch.compiledJavascriptDir;

  keys(deps).forEach(function(name) {
    var filename = path.resolve(jsDir, name);

    var modules = deps[name].map(function(dep) {
      return "  '" + path.relative(jsDir, dep).replace(/\.js$/, '').split(path.sep).join('/') + "'";
    });

    fs.writeFileSync(filename, 'define([\n' + modules.sort().join(',\n') + '\n]);');
  });

  next();
}

function _destroyDeps(mimosaConfig, options, next) {
  keys(mimosaConfig.requireDeps.deps).forEach(function(name) {
    var filename = path.resolve(mimosaConfig.watch.compiledJavascriptDir, name);
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
  });

  deps = {};

  next();
}

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};