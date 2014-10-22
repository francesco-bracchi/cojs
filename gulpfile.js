"use strict";

var gulp = require('gulp'),
    del = require('del'),
    sweetjs = require('gulp-sweetjs'),
    istanbul = require('gulp-istanbul'),
    mocha = require('gulp-mocha'),
    browserify = require('gulp-browserify'),
    path = require('path'),
    build = 'build';

gulp.task('distclean', ['clean'], function(done) {
  del(['node_modules','**/*~'], done);
});

gulp.task ('clean', function (done) {
  del(build, done);
});

gulp.task('macros', function () {
  return gulp
    .src('src/**/*.sjs')
    .pipe(gulp.dest(build));
});

gulp.task ('expand', ['macros'], function () {
  return gulp
    .src(['src/**/*.js'])
    .pipe(sweetjs ({
      modules: ['./build/lib/macros'],
      sourceMap: true
    }))
    .pipe(gulp.dest(build));
});

gulp.task('browserify', ['expand'], function () {
  gulp
    .src(build + '/browser-repl/repl.js')
    .pipe(browserify())
    .pipe(gulp.dest(build + '/browser-repl'));
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

gulp.task('default', ['lib', 'browser-repl']);

var expandFile = function (event) {
  var dir = path.dirname(event.path),
      pwd = path.resolve(),
      rel = path.relative(pwd, dir);
  return gulp
    .src(event.path)
    .pipe(sweetjs ({
      modules: ['./src/lib/macros'],
      sourceMap: true
    }))
    .pipe(gulp.dest(rel.replace(/^src/, build)));
};

gulp.task('watch', function () {
  gulp.watch('src/lib/macros/*.sjs', ['expand']);
  gulp.watch('src/**/*.js', expandFile);
  gulp.watch('src/browser-repl/repl.js', ['browserify']);
  // **todo** use a callback like expandFile
  gulp.watch('src/**/*.css', ['css']);
  gulp.watch('src/**/*.html', ['html']);
});

gulp.task('lib', ['expand'], function () {
  return gulp
    .src(['package.json', 'README.md'])
    .pipe(gulp.dest(build + '/lib'));
});

gulp.task('test', ['expand'], function () {
  return gulp.src([build + '/lib/**/*.js'])
    .pipe(istanbul())
    .on('finish', function () {
      gulp
        .src(build + '/test/test.js', {
          read: false
        })
        .pipe(mocha({
          reporter: 'nyan'
        }))
        .pipe(istanbul.writeReports({
          dir: build + '/coverage'
        }));
    });
});
