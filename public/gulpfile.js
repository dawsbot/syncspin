var gulp = require('gulp');
var inject = require('gulp-inject');

gulp.task('inject', function() {
  var sources = {
    css: ['./bower_components/bootstrap/dist/css/bootstrap.min.css'],
    js: [
      './bower_components/jquery/dist/jquery.min.js',
      './bower_components/angular/angular.min.js',
      './bower_components/bootstrap/dist/js/bootstrap.min.js',
      './bower_components/angular-ui-router/release/angular-ui-router.min.js',
      './bower_components/socket.io-client/socket.io.js'
    ]
  };

  return gulp.src('./index.html')
    .pipe(inject(gulp.src(sources.css)))
    .pipe(inject(gulp.src(sources.js)))
    .pipe(gulp.dest('./'));
});
