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

    var cmdModule = require('../lib/cmdModule')(grunt);

    grunt.registerMultiTask('combo', 'Concat SeaJS modules', function () {
        var config = this.data;
        var src = this.data.src;
        var dest = this.data.dest;
        var initModules = this.data.initModules;

        var loader = path.resolve(__dirname, '..', 'lib', 'loader.js');

        grunt.file.expandFiles(src + initModules).forEach(function (jsFile) {
            var modName = jsFile.replace(src, '').replace(/\.js$/, '');
            grunt.log.writeln('Module ' + modName.cyan + ' created.');

            var depsQueue = [];
            var modules = {};
            var sourceMaps = {};
            cmdModule.moduleWalk(modName, src, function (modName, ast) {
                if (!modules[modName]) {
                    var result = cmdModule.generateJSCode(ast, modName, config.sourceMap);
                    modules[modName] = result.code;
                    sourceMaps[modName] = result.map;
                }
            }, depsQueue);

            depsQueue = depsQueue.sort();
            depsQueue.push(modName);

            var finalMap = null;
            if (config.sourceMap) {
                finalMap = new sourceMap.SourceMapGenerator(_.defaults({
                    file: modName + '.combo.js'
                }, config.sourceMap));
            }

            var finalCode = depsQueue.reduce(function (memo, modName) {
                memo = memo.replace(/\r\n/g, '\n').replace(/\r/g, '\n') + ';\n';

                var lineCount = memo.split('\n').length - 1;

                if (config.sourceMap) {
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

                return memo + modules[modName];
            }, grunt.file.read(loader));

            var outputfile = jsFile.replace(src, dest).replace(/\.js$/, '.combo.js');

            if (config.sourceMap) {
                finalCode += '\n;//@ sourceMappingURL=' + modName + '.combo.js.map';
                grunt.file.write(outputfile + '.map', finalMap.toString());
            }

            grunt.file.write(outputfile, finalCode);
        });
    });
};
