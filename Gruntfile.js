module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      sweetjs: {
	options: {
	  modules: ['./macros/go.js']
	},
	timeout: {
	  src: 'src/lib/timeout.js',
	  dest: 'build/lib/timeout.js'
	},
	channel: {
	  src: 'src/lib/channel.js',
	  dest: 'build/lib/channel.js'
	}
      },
      // uglify: {
      //   build: {
      //     files: {
      //       'build/go.min.js': ['build/go.js']
      //     }
      //   }
      // }
    });

  grunt.loadNpmTasks('grunt-sweet.js');

  // grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [
    'sweetjs'
  //  ,'uglify'
  ]);

};
