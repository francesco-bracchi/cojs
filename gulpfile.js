"use strict";

var gulp = require('gulp'),
    env = require('gulp-util').env,
    log = require('gulp-util').log,
    sweetjs = require('gulp-sweetjs'),
    jshint = require('gulp-jshint'),
    sweet = sweetjs({modules: ['./macros/go']});

var codeFiles = ['**/*.js', '!node_modules/**'];

gulp.task('lint', function(){
  log('Linting Files');
  return gulp.src(codeFiles)
    .pipe(jshint('jshint.json'))
    .pipe(jshint.reporter());
});

gulp.task('watch', function(){
  log('Watching Files');
  gulp.watch(codeFiles, ['lint']);
});

gulp.task ('expand', function () {
  gulp.src('src/channels/timeout.js')
    .pipe(sweet)
    .pipe(gulp.dest('dist/channels'));
});

// gulp.start('expand');


