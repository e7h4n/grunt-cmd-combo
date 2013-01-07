var UglifyJS = require('uglify-js');
var path = require('path');
var _ = require('underscore');

module.exports = function (grunt) {
    function normlizePath(ast, relativePath, rootPath) {
        var walker = new UglifyJS.TreeWalker(function (node, descend) {
            if (!(node instanceof UglifyJS.AST_Call)) {
                return;
            }

            if (node.expression.property !== undefined) {
                return;
            }

            if (node.start.value !== 'require') {
                return;
            }

            var modName = node.args[0].value;

            var string = new UglifyJS.AST_String({
                value: path.resolve(relativePath, modName).replace(path.resolve(rootPath), '').replace(/^\//, '')
            });
            node.args.pop();
            node.args.push(string);
        });

        ast.walk(walker);

        return ast;
    }

    function getJSDependencies(ast) {
        var deps = [];

        var walker = new UglifyJS.TreeWalker(function (node, descend) {
            if (!(node instanceof UglifyJS.AST_Call)) {
                return;
            }

            if (node.expression.property !== undefined) {
                return;
            }

            if (node.start.value !== 'require') {
                return;
            }

            deps.push(node.args[0].value);
        });

        ast.walk(walker);

        return deps;
    }

    function moduleWalk(modName, rootPath, process, trace) {
        var ast, content, deps, fileType, filename;

        if (trace === null) {
            trace = [];
        }

        deps = [];
        content = grunt.file.read(rootPath + modName + '.js');
        ast = UglifyJS.parse(content);
        ast = normlizePath(ast, path.dirname(path.resolve(rootPath, modName + '.js')), rootPath);
        deps = getJSDependencies(ast);
        process(modName, ast);

        return deps.map(function (modName) {
            if ((trace.indexOf(modName)) === -1) {
                trace.push(modName);
                return moduleWalk(modName, rootPath, process, trace);
            }
        });
    }

    function generateJSCode(ast, modName, sourceMapOptions) {
        var string = new UglifyJS.AST_String({
            value: modName
        });

        var walker = new UglifyJS.TreeWalker(function (node, descend) {
            if (node instanceof UglifyJS.AST_Call && node.start.value === 'define' && node.args.length === 1) {
                node.args.unshift(string);
            }
        });

        ast.walk(walker);

        var sourceMap = null;
        if (sourceMapOptions) {
            sourceMap = UglifyJS.SourceMap();
        }

        var code = ast.print_to_string({
            comments: 'all',
            beautify: true,
            source_map: sourceMap
        });

        return {
            code: code,
            map: sourceMap && sourceMap.toString()
        };
    }

    return {
        moduleWalk: moduleWalk,
        generateJSCode: generateJSCode
    };
};
