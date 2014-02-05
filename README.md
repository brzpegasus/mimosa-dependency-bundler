#mimosa-dependency-bundler

> For more information regarding Mimosa, see http://mimosa.io.

## Overview

This module takes a set of AMD modules and generates a file that contains a single `define` call with all those modules listed out as dependencies.

```javascript
// Module config
dependencyBundler: {
  bundles: [{ name: 'foo.js', dependencies: ['app/foo1/', 'app/foo2/'] }]
}

// Generated `foo.js`
define([
  'app/foo1/a',
  'app/foo1/b/bar',
  'app/foo2/c/baz'
]);
```

## Use Cases

This is useful when all you care about is to import a bunch of dependencies into a module, in no particular order, and there are enough of them that handling the imports yourself becomes unmanageable. You can instead import just the AMD module that mimosa-dependency-bundler generates.

### Loading Modules in an Ember Application

By far the biggest motivation for this was to have something that would take care of loading all necessary modules up front so that they are [immediately available to Ember's resolver](http://discuss.emberjs.com/t/overriding-defaultresolver-methods/2661/9) at the time of the dependency lookup.

Without mimosa-dependency-bundler, you could alternatively concatenate all dependencies into a single file and load it up with a single `<script>` tag, but it would mean regenerating this concatenated file on every file change, whereas here, you get to keep files separate during development.

### Loading Test Files

If you use RequireJS and need to load all the files in your app's `tests` folder, mimosa-dependency-bundler can help here too. Just specify the filename pattern(s), the name of the file to generate, and have this be maintained by Mimosa as you add or remove tests.

## Usage

Add `'dependency-bundler'` to your list of modules. That's all!  Mimosa will install the module for you when you start `mimosa watch` or `mimosa build`.

## Configuration

```javascript
// Example configuration in `mimosa-config.js`
dependencyBundler: {
  bundles: [
    { name: 'modules.js', dependencies: [/app\/(components|controllers|models|routes|views)\//] },
    { name: 'tests.js', dependencies: ['tests/unit/', 'tests/integration/']}
  ]
}
```

For each bundle:

* `name`: The path of the file to generate, relative to Mimosa's compiled directory (`watch.compiledDir`)
* `dependencies`: An array of strings or regexes to match. Only `.js` files are considered (either plain JS or once compiled to JS)

By default, mimosa-dependency-bundler does not configure any bundles.
