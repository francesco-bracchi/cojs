"use strict";

var gulp = require('gulp'),
    gutil = require ('gulp-util'),
    sweetjs = require('gulp-sweetjs'),
    clean = require('gulp-clean'),
    frep = require ('gulp-frep');

gulp.task('default', ['dist']);

gulp.task ('runtime', ['macros'], function () {
  gulp
    .src("src/**/*.js")
    .pipe(sweetjs({modules: ['./dist/macros']}))
    .pipe(gulp.dest('dist'));
});

gulp.task ('macros', function () {
  gulp
    .src("macros/*.js")
    .pipe (frep([{
      pattern: /require(.*)/,
      replacement: "require('gozilla')"
    }]))
    .pipe (gulp.dest('dist/macros'));
});

gulp.task ('package.json', function () {
  gulp
    .src('package.json')
    .pipe(gulp.dest('dist'));
});

gulp.task ('dist', ['runtime', 'package.json']);

gulp.task ('clean', function () {
  gulp
    .src ('dist', {read: false})
    .pipe (clean());
});

gulp.task ('local_install', ['dist'], function () {
  gulp
    .src ('dist/**/*.js')
    .pipe(gulp.dest('node_modules/gozilla'));
});

gulp.task('test', ['local_install'], function () {

});
