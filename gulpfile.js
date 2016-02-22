var gulp = require('gulp')
var babel = require('gulp-babel')
var paths = { srcDir: ['src/**/*.js'], destDir: 'lib' }

gulp.task('babel', function () {
  return gulp.src(paths.srcDir).pipe(babel()).pipe(gulp.dest(paths.destDir))
})

gulp.task('watch', function () {
  gulp.watch(paths.srcDir, ['babel'])
})

gulp.task('default', ['watch'])
