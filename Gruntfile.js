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
            options: {
                sourceMap: {
                    sourceRoot: '/src/'
                }
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/src/',
                    src: '**/*.js',
                    dest: 'test/dist',
                    ext: '.combo.js'
                }]
            }
        },

        connect: {
            server: {
                options: {
                    port: 18000,
                    base: 'test/'
                }
            }
        },

        qunit: {
            all: {
                options: {
                    timeout: 1000,
                    urls: [
                        'http://localhost:18000/test.html'
                    ]
                }
            }
        }
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('test', ['combo', 'connect', 'qunit']);
};
