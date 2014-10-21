"use strict";

var gulp = require('gulp'),
    gutil = require ('gulp-util'),
    sweetjs = require('gulp-sweetjs'),
    del = require('del'),
    frep = require ('gulp-frep'),
    exec = require ('child_process').exec,
    debug = require('gulp-debug'),
    browserify = require('gulp-browserify'),
    path = require('path'),
    build = 'build';

gulp.task('distclean', ['clean'], function(done) {
  del('node_modules', done);
});

gulp.task ('clean', function (done) {
  del(build, done);
});

gulp.task('docco', function () {
  var src = "src/*.js src/**/*.js src/*.sjs src/**/*.sjs";
  exec ('node_modules/.bin/docco-husky ' + src);
});

gulp.task ('expand', function () {
  return gulp
    .src(['src/**/*.js'])
    .pipe(sweetjs ({modules: ['./src/lib/macros']}))
    .pipe(gulp.dest(build));
});

gulp.task('browserify', ['expand'], function () {
  gulp
    .src(build + '/browser-repl/repl.js')
    .pipe(browserify())
    .pipe(gulp.dest(build + '/browser-repl'));
  // .pipe(gulp.dest(build + '/browser-repl.browserify'))
  // .pipe(minify())
  // .pipe(gulp.dest(build + '/browser-repl.minified'));
});

gulp.task('html', function () {
  gulp
  .src(['src/**/*.html'])
  .pipe(gulp.dest(build));
});

gulp.task('css', function () {
  gulp
  .src(['src/**/*.css'])
  .pipe(gulp.dest(build));
});

gulp.task('browser-repl', ['browserify', 'html', 'css']);

gulp.task('default', ['expand', 'browser-repl']);

var expandFile = function (event) {
  var dir = path.dirname(event.path),
      pwd = path.resolve(),
      rel = path.relative(pwd, dir);
  return gulp
    .src(event.path)
    .pipe(sweetjs ({modules: ['./src/lib/macros']}))
    .pipe(gulp.dest(rel.replace(/^src/, 'build')));
};

gulp.task('watch', function () {
  gulp.watch('src/lib/macros/*.sjs', ['expand']);
  gulp.watch('src/**/*.js', expandFile);
  gulp.watch('src/browser-repl/repl.js', ['browserify']);
  // **todo** use a callback like expandFile
  gulp.watch('src/**/*.css', ['css']);
  gulp.watch('src/**/*.html', ['html']);
});

// gulp.task ('publish', ['dist'], function () {
//   exec ('npm publish dist/src');
// })
