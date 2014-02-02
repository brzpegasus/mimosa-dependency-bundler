'use strict';

exports.defaults = function() {
  return {
    dependencyBundler: {
      bundles: []
    }
  };
};

exports.placeholder = function() {
  return "\t\n\n" +
         "  # dependencyBundler:\n" +
         "    # bundles: []\n";
};

exports.validate = function(mimosaConfig, validators) {
  var errors = [];

  // TODO

  return errors;
};
