'use strict';

var path = require('path');

var normalizePath = function(filename) {
  if (path.sep === '/') {
    return filename;
  }
  return filename.split(path.sep).join('/');
};

exports.normalizePath = normalizePath;

exports.normalizePattern = function(pattern) {
  return (typeof pattern === 'string') ? normalizePath(pattern) : pattern;
};

exports.patternMatch = function(value, patterns) {
  return patterns.some(function(pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(value);
    } else {
      return value.indexOf(pattern) > -1;
    }
  });
};

exports.fileNameToModuleId = function(filename) {
  return normalizePath(filename.replace(/\.(.)+$/, ''));
};
