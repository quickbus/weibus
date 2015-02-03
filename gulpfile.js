'use strict';
var gulp = require('gulp');
var less = require('gulp-less');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');

gulp.task('default', ['less']);

gulp.task('less', function() {
  return gulp.src('less/style.less')
    .pipe(less())
    .on('error', function(e) {
      gutil.log(e);
      this.emit('end');
    })
    .pipe(gulp.dest('public/stylesheets/'));
});


gulp.task('watch', function() {
  gulp.watch('less/style.less', ['less']);
});


gulp.task('imagemin', function() {
  return gulp.src('./public/images/ads/*.png')
    .pipe(imagemin({
      progressive: true,
      optimizationLevel: 0
    }))
    .pipe(gulp.dest('public/images/ads/min'));
});
