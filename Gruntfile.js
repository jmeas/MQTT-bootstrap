module.exports = function(grunt) {
	grunt.initConfig({
		concat:{
			dist: {
				src: [
					'js/directives/mqttControls.js',
					'js/directives/mqttBar.js',
					'js/directives/mqttDoughnut.js',
					'js/directives/mqttPublisher.js',
				],
				dest: 'dist/mqttControls.full.js'
			}
		},
		watch: {
			js: {
				files: ['js/**/*.js'],
				tasks: ['concat', 'uglify'],
			}
		},
		uglify: {
			my_target: {
				files: {
					'dist/mqttControls.min.js': [
					'js/directives/mqttControls.js',
					'js/directives/mqttBar.js',
					'js/directives/mqttDoughnut.js',
					'js/directives/mqttPublisher.js',
					]
				}
			}
		}
  	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['watch']);
};