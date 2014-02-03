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
  var errors = [],
      config = mimosaConfig.dependencyBundler;

  if (validators.ifExistsIsObject(errors, 'dependencyBundler config', config)) {
    if (validators.isArrayOfObjects(errors, 'dependencyBundler.bundles', config.bundles)) {
      config.bundles.forEach(function(bundle) {
        validators.ifExistsIsString(errors, 'dependencyBundler.bundles name', bundle.name);
        validators.isArray(errors, 'dependencyBundler.bundles dependencies', bundle.dependencies);
      });
    }
  }
  return errors;
};
