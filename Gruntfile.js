module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
				pkg: grunt.file.readJSON('package.json'),
				sweetjs: {
						options: {
								modules: ['./macros/go.js']
						},
						build: {
								src: 'src/lib/*.js',
								dest: 'build/go.js'
						}
				}
    });
    
		grunt.loadNpmTasks('grunt-sweet.js');
    
    grunt.registerTask('default', ['sweetjs']);

};
