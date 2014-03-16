"use strict";

var gulp = require('gulp'),
    gutil = require ('gulp-util'),
    sweetjs = require('gulp-sweetjs'),
    clean = require('gulp-clean'),
    frep = require ('gulp-frep'),
    exec = require ('child_process').exec,
    debug = require('gulp-debug'),
    browserify = require('gulp-browserify');

var paths = {
  'src': "src/**/*.js",
  'macros': "src/macros/*.js",
  'examples': 'examples/*.js'
};

gulp.task('default', ['dist']);

gulp.task ('clean', function () {
  return gulp
    .src (['dist'], {read: false})
    .pipe (clean());
});

gulp.task('docco', function () {
  var src = "src/*.js src/**/*.js";
  exec ('node_modules/.bin/docco-husky ' + src);
});

gulp.task ('sweeten', ['sweeten/src']);

gulp.task ('sweeten/src', function () {
  return gulp
    .src([paths.src, "!" + paths.macros])
    .pipe(sweetjs ({modules: ['./src/macros']}))
    .pipe(gulp.dest('dist/src'));
});

gulp.task ('sweeten/examples', function () {
  return gulp
    .src(paths.examples)
    .pipe(sweetjs ({modules: ['./src/macros']}))
    .pipe(frep([{
      pattern: "'\.\/src\/core'",
      replacement: "'..\/src\/core'"
    }]))
    .pipe(gulp.dest('dist/examples'));
});

gulp.task ('sweeten/browser-repl', function () {
  gulp
    .src ('examples/browser-repl/js/repl.js')
    .pipe(sweetjs ({modules: ['./src/macros']}))
    // .pipe(frep([{
    //   pattern: "'\.\/src\/core'",
    //   replacement: "'..\/src\/core'"
    // }]))
    .pipe (gulp.dest ('dist/examples/browser-repl/js'));
});

gulp.task ('ring', ['sweeten/src', 'sweeten/examples']);
gulp.task ('ping', ['sweeten/src', 'sweeten/examples']);

gulp.task ('browserify/browser-repl', [
  'sweeten/src',
  'sweeten/browser-repl'
], function () {
  gulp
    .src('dist/examples/browser-repl/js/repl.js')
    .pipe(browserify())
    .pipe(gulp.dest('dist/examples/browser-repl/js'));
});

gulp.task ('browser-repl', [
  'browserify/browser-repl'
], function () {
  gulp
    .src(['examples/browser-repl/*.html', 'examples/browser-repl/**/*.css'])
    .pipe(gulp.dest('dist/examples/browser-repl'));
});

gulp.task ('watch', ['sweeten'], function () {
  gulp.watch(paths.macros, ['sweeten']);
  gulp.watch(paths.src, ['sweeten/src']);
  gulp.watch(paths.examples, ['sweeten/examples']);
});

gulp.task ('macros', function () {
  gulp
    .src(paths.macros)
    .pipe(gulp.dest('dist/src/macros'));
});

gulp.task ('package',function () {
  gulp
    .src(['package.json', 'README.md'])
    .pipe(gulp.dest('dist/src'));
});

gulp.task ('dist', ['sweeten', 'macros', 'package']);
