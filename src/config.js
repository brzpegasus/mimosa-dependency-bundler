'use strict';

exports.defaults = function() {
  return {
    deps: {}
  };
};

exports.placeholder = function() {
  return "\t\n\n"+
         "  # deps: {}\n";
};

exports.validate = function(mimosaConfig, validators) {
  var errors = [],
      config = mimosaConfig.requireDeps;

  if (validators.ifExistsIsObject(errors, 'requireDeps config', config)) {

    if (validators.ifExistsIsObject(errors, 'requireDeps.deps', config.deps)) {
      Object.keys(config.deps).forEach(function(name) {
        validators.ifExistsIsString(errors, 'requireDeps.deps.' + name, name);
        if (!config.deps[name] instanceof RegExp) {
          errors.push("requireDeps.deps[' + name + '] must be a regular expression.");
        }
      });
    }
  }

  return errors;
};
