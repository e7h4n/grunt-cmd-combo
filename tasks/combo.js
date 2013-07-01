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
    var sourceMap = require('source-map');
    var _ = require('underscore');
    var sloc = require('sloc');

    var cmdModule = require('../lib/cmdModule')(grunt);

    grunt.registerMultiTask('combo', 'Concat SeaJS modules', function () {
        var options = this.options();

        var loader = grunt.file.read(path.resolve(__dirname, '..', 'lib', 'loader.js'));
        this.files.forEach(function (file) {
            var jsFile = file.src[0];
            var root = file.orig.cwd;

            var modName = jsFile.replace(root, '').replace(/\.js$/, '');
            grunt.log.writeln('Module ' + modName.cyan + ' created.');

            var depsQueue = [];
            var modules = {};
            var sourceMaps = {};
            cmdModule.moduleWalk(modName, root, function (modName, ast) {
                if (!modules[modName]) {
                    var result = cmdModule.generateJSCode(ast, modName, options.sourceMap);
                    modules[modName] = result.code;
                    sourceMaps[modName] = result.map;
                }
            }, depsQueue);

            depsQueue = depsQueue.sort();
            depsQueue.push(modName);

            var finalMap = null;
            var lineCount = sloc(loader, 'javascript').loc;
            if (options.sourceMap) {
                finalMap = new sourceMap.SourceMapGenerator(_.defaults({
                    file: modName + file.orig.ext
                }, options.sourceMap));

                for (var i = 1; i <= lineCount; i++) {
                    finalMap.addMapping({
                        generated: {
                            line: i,
                            column: 1
                        },
                        original: {
                            line: i,
                            column: 1
                        },
                        source: 'loader.js'
                    });
                }
            }

            var finalCode = depsQueue.reduce(function (memo, modName) {
                if (options.sourceMap) {
                    var consumer = new sourceMap.SourceMapConsumer(sourceMaps[modName]);
                    consumer.eachMapping(function (mapping) {
                        var newMapping = {
                            generated: {
                                line: mapping.generatedLine + lineCount,
                                column: mapping.generatedColumn
                            },
                            original: {
                                line: mapping.originalLine,
                                column: mapping.originalColumn
                            },
                            source: modName + '.js'
                        };

                        if (mapping.name) {
                            newMapping.name = mapping.name;
                        }

                        finalMap.addMapping(newMapping);
                    });
                }

                lineCount += sloc(modules[modName], 'javascript').loc;

                return memo + modules[modName];
            }, loader);

            var destFile = path.normalize(file.dest);

            if (options.sourceMap) {
                finalCode += '\n;//@ sourceMappingURL=' + modName + file.orig.ext + '.map';
                grunt.file.write(destFile + '.map', finalMap.toString());
            }

            grunt.file.write(destFile, finalCode);
        });
    });
};
