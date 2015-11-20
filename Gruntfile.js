module.exports = function(grunt) {

    grunt.initConfig({
        nodemon: {
            script: 'Public/content/server.js'
        },
        watch: {
            files: ['*.*'],
            tasks: ['nodemon']
        }
    });

    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.task.registerTask('default', ['nodemon']);

};
