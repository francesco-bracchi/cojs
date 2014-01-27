module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	sweetjs: {
	    options: {
		// Task-specific options go here.
		src: 'src/**/*.js',
		modules: ['./macros/go.js']
	    }
	},
	uglify: {
	    options: {
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
	    },
	    build: {
		src: 'src/lib.js',
		dest: 'build/<%= pkg.name %>.min.js'
	    }
	},
	my_src_files: ['src/*.js', 'src/lib/*.js'],
    });

    // Load the plugin that provides "sweet" task
    grunt.loadNpmTasks('grunt-sweet.js');
    
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');


    // Default task(s).
    grunt.registerTask('default', ['sweetjs']);

};
