"use strict";

var gulp = require('gulp'),
    gutil = require ('gulp-util'),
    sweetjs = require('gulp-sweetjs'),
    clean = require('gulp-clean'),
    frep = require ('gulp-frep'),
    exec = require ('child_process').exec;

var gozillify = frep([{
  pattern: /\.\/src/,
  replacement: "gozilla"
}]);

gulp.task('default', ['dist']);

gulp.task ('lib', function () {
  return gulp
    .src(["src/**/*.js", "package.json", "!src/tasks/*.js", "!src/chan.js"])
    .pipe (gozillify)
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('lib/tasks', ['lib'], function () {
  return gulp
    .src(['src/tasks/*.js'])
    .pipe(sweetjs({modules: ['./dist/lib/macros']}))
    .pipe(gulp.dest('dist/lib/tasks'));
});

gulp.task('lib/sweeten', ['lib'], function () {
  return gulp
    .src(['src/chan.js', 'src/alt.js'])
    .pipe(sweetjs({modules: ['./dist/lib/macros']}))
    .pipe(gulp.dest('dist/lib'));
});

gulp.task ('dist', ['lib', 'lib/sweeten', 'lib/tasks']);

gulp.task ('clean', function () {
  return gulp
    .src (['dist', 'node_modules/gozilla'], {read: false})
    .pipe (clean());
});

gulp.task ('localinstall', ['dist'], function () {
  return gulp
    .src('dist/lib/**/*.js')
    .pipe(gulp.dest('node_modules/gozilla'));
});

gulp.task('docco', function () {
  var src = "src/*.js src/**/*.js";
  exec ('node_modules/.bin/docco-husky ' + src);
});

gulp.task('examples', function () {
  return gulp
    .src("examples/*.js")
    .pipe(gozillify)
    .pipe(sweetjs({modules: ['gozilla/macros']}))
    .pipe(gulp.dest ('dist/examples'));
});
