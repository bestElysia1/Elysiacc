const gulp = require('gulp');
const obfuscator = require('gulp-javascript-obfuscator');

gulp.task('obfuscate', () => {
  return gulp.src('dist/bundle.js')
    .pipe(obfuscator({
      compact: true,
      controlFlowFlattening: true,
      stringArray: true,
      stringArrayEncoding: ['base64']
    }))
    .pipe(gulp.dest('dist'));
});