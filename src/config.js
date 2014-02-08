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
         "  # dependencyBundler:  # Module configuration (more in the module README)\n" +
         "    # bundles: []       # Each bundle object must specify a `name` property\n" +
         "                        # with the bundle file path as the value, a `dependencies`\n" +
         "                        # array of string patterns or regexes for matching files to\n" +
         "                        # include in the bundle, and optionally an `exclude` array\n" +
         "                        # of string patterns or regexes for matching files to exclude.\n";
};

exports.validate = function(mimosaConfig, validators) {
  var errors = [],
      config = mimosaConfig.dependencyBundler;

  if (validators.ifExistsIsObject(errors, 'dependencyBundler config', config)) {
    if (validators.isArrayOfObjects(errors, 'dependencyBundler.bundles', config.bundles)) {
      config.bundles.forEach(function(bundle) {
        validators.ifExistsIsString(errors, 'dependencyBundler.bundles name', bundle.name);
        validators.isArray(errors, 'dependencyBundler.bundles dependencies', bundle.dependencies);
        validators.ifExistsIsArray(errors, 'dependencyBundler.bundles exclude', bundle.exclude);
      });
    }
  }

  return errors;
};