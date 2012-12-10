module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',

        watch: {
            files: '<config:jslint.files>',
            tasks: 'jslint test'
        },

        jslint: {
            files: [
                'lib/**/*.js',
                'test/**/*.js'
            ],

            exclude: [
                'test/dist/**/*.js'
            ],

            directives: {
                unparam: true,
                unused: true,
                node: true,
                vars: true,
                nomen: true,
                indent: 4,
                plusplus: true,
                sloppy: true
            },

            options: {
                errorsOnly: true
            }
        },

        combo: {
            test: {
                src: 'test/src/',
                dest: 'test/dist/',
                initModules: 'main.js'
            }
        },

        server: {
            port: 8990,
            base: 'test/'
        },

        qunit: {
            all: [
                'http://localhost:8990/test.html'
            ]
        }
    });

    grunt.loadTasks('tasks');

    grunt.registerTask('test', 'combo server qunit');
};
