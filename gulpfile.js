"use strict";

var gulp = require('gulp'),
    gutil = require ('gulp-util'),
    sweetjs = require('gulp-sweetjs'),
    clean = require('gulp-clean'),
    docco = require ('gulp-docco'),
    frep = require ('gulp-frep');

gulp.task('default', ['dist']);

gulp.task ('macros', function () {
  return gulp
    .src("macros/*.js")
    .pipe (frep([{
      pattern: /require(.*)/,
      replacement: "require('gozilla')"
    }]))
    .pipe (gulp.dest('dist/macros'));
});

gulp.task ('runtime', ['macros'], function () {
  return gulp
    .src("src/**/*.js")
    .pipe(sweetjs({modules: ['./dist/macros']}))
    .pipe(gulp.dest('dist'));
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
  return gulp
    .src ('dist/**/*.js')
    .pipe(gulp.dest('node_modules/gozilla'));
});

gulp.task ('docs', function () {
  gulp
    .src(['src/lib/*.js', 'macros/*.js'])
    .pipe (docco())
    .pipe (gulp.dest('dist/docs'));
});

gulp.task('examples', ['local_install'], function () {
  gulp
    .src("examples/**/*.js")
    .pipe (frep([{
      pattern: /require(.*)/,
      replacement: "require('gozilla')"
    }]))
    .pipe(sweetjs({modules: ['gozilla/macros']}))
    .pipe(gulp.dest ('dist/examples'));
});
