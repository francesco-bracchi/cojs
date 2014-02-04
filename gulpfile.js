"use strict";

var gulp = require('gulp');
var gutil = require ('gulp-util');
var sweetjs = require('gulp-sweetjs');;

var codeFiles = ['**/*.js', '!node_modules/**', '!macros/**'];

gulp.task ('dist', function () {
  gulp
    .src("src/**/*.js")
    .pipe(sweetjs({modules: ['./macros/go.js']}))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['dist']);


