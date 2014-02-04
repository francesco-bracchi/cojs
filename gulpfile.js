"use strict";

var gulp = require('gulp'),
    gutil = require ('gulp-util'),
    sweetjs = require('gulp-sweetjs'),
    clean = require('gulp-clean');

var codeFiles = ['**/*.js', '!node_modules/**', '!macros/**'];

gulp.task ('runtime', function () {
  gulp
    .src("src/**/*.js")
    .pipe(sweetjs({modules: ['./macros']}))
    .pipe(gulp.dest('dist'));
});

gulp.task ('macros', function () {
  gulp
  .src("macros/*.js")
  .pipe (gulp.dest('dist/macros'));
});

gulp.task ('package.json', function () {
  gulp
    .src('package.json')
    .pipe(gulp.dest('dist'));
});

gulp.task ('clean', function () {
  gulp
    .src ('dist', {read: false})
    .pipe (clean());
});

gulp.task('default', ['runtime', 'macros', 'package.json']);


