/*
 * combo.js
 *
 * Copyright (c) 2012 'PerfectWorks' Ethan Zhang
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

/*jslint node: true*/

module.exports = function (grunt) {
    var path = require('path');
    var fs = require('fs');
    var cmdModule = require('../lib/cmdModule')(grunt);

    grunt.registerMultiTask('combo', 'Concat SeaJS modules', function () {
        var src = this.data.src;
        var dest = this.data.dest;
        var initModules = this.data.initModules;

        var loader = path.resolve(__dirname, '..', 'lib', 'loader.js');

        grunt.file.expandFiles(src + initModules).forEach(function (jsFile) {
            var modName = jsFile.replace(src, '').replace(/\.js$/, '');
            grunt.log.writeln('Module ' + modName.cyan + ' created.');

            var depsQueue = [];
            var modules = {};
            cmdModule.moduleWalk(modName, src, function (modName, ast) {
                modules[modName] = modules[modName] || cmdModule.generateJSCode(ast, modName);
            }, depsQueue);

            depsQueue = depsQueue.sort();
            depsQueue.push(modName);
            var finalCode = depsQueue.reduce(function (memo, modName) {
                return memo + modules[modName];
            }, grunt.file.read(loader));

            var outputfile = jsFile.replace(src, dest).replace(/\.js$/, '.combo.js');
            grunt.file.write(outputfile, finalCode);
        });
    });
};
