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
      replacement: "require('gozilla/core')"
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

gulp.task ('docs/macros', function () {
  gulp
    .src('macros/*.js')
    .pipe (docco())
    .pipe (gulp.dest('dist/macros'));
});

gulp.task ('docs/main', function () {
  gulp
    .src('src/*.js')
    .pipe (docco())
    .pipe (gulp.dest('dist/docs/src'));
});

gulp.task ('docs/data_structures', function () {
  gulp
    .src('src/data_structures/*.js')
    .pipe (docco())
    .pipe (gulp.dest('dist/docs/src/data_structures'));
});

gulp.task ('docs/channels', function () {
  gulp
    .src('src/channels/*.js')
    .pipe (docco())
    .pipe (gulp.dest('dist/docs/src/channels'));
});

gulp.task('docs', ['docs/macros', 'docs/main', 'docs/channels', 'docs/data_structures']);

gulp.task('examples', ['local_install'], function () {
  gulp
    .src("examples/**/*.js")
    .pipe (frep([{
      pattern: /require(.*)/,
      replacement: "require('gozilla/chan')"
    }]))
    .pipe(sweetjs({modules: ['gozilla/macros']}))
    .pipe(gulp.dest ('dist/examples'));
});
