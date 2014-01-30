module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sweetjs: {
      options: {
	      modules: ['./macros/go.js']
	    },
	    timeout: {
	      src: 'src/channels/timeout.js',
	      dest: 'build/channels/timeout.js'
	    },
	    slurp: {
	      src: 'src/channels/slurp.js',
	      dest: 'build/channels/slurp.js'
	    },
	    spit: {
	      src: 'src/channels/spit.js',
	      dest: 'build/channels/spit.js'
	    }
    },
    copy: {
      libs: {
        expand: true, 
	      cwd: 'src/',
        src: ['lib/**.js', 'index.js'], 
        dest: 'build'
	    },
			macros: {
        expand: true, 
        src: ['macros/**.js'], 
        dest: 'build'
	    },
			package: {
			  expand: true,
			  src: ['package.json', 'README.md'],
        dest: 'build'
			}
    }
      // uglify: {
      //   build: {
      //     files: {
      //       'build/go.min.js': ['build/go.js']
      //     }
      //   }
      // }
  });

  
  grunt.loadNpmTasks('grunt-sweet.js');
  grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  
  grunt.registerTask('build-channels', [ 'sweetjs:timeout', 'sweetjs:slurp', 'sweetjs:spit' ]);

  grunt.registerTask('build', [
      'build-channels',
      'copy:libs',
      'copy:macros',
      'copy:package'
  ]);

};
