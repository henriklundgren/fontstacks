var Combine = require('stream-combiner');
var gulp    = require('gulp');
var gutil   = require('gulp-util');
var pkg     = require('./package.json');
var fs      = require('fs');

var csscomb = require('gulp-csscomb');
var recess  = require('gulp-recess');
var minify  = require('gulp-csso');
var less    = require('gulp-less'); // https://github.com/christophehurpeau/gulp-less
var prefix  = require('gulp-autoprefixer');
var rename  = require('gulp-rename');
var jade    = require('gulp-jade');
var deploy = require('gulp-gh-pages');
var parseless = require('parsless');
var css = require('css');

var csscomb_options = require('./csscomb.json');
var recess_options = {
  strictPropertyOrder: false
};
var deployOptions = {
  "origin":  "home"
}
var fontstacks = require('./src/fontstacks.json');

gulp.task('example', function() {
  gulp.src('./.gh-pages/*.jade')
    .pipe(jade({
      pretty: true,
      locals: { pkg: pkg, fontstacks: fontstacks }
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('stylesheet', function() {
  var combined = Combine(
    gulp
    .src('./src/main.less'),

    recess({noOverqualifying: false}),

    less({
      modifyVars: {
        'monospace': fontstacks.monospace.stack.toString(),
        'monospace-foss' : fontstacks['monospace-foss'].stack.toString(),
        'georgia': fontstacks.georgia.stack.toString(),
        'georgia-foss': fontstacks['georgia-foss'].stack.toString(),
        'verdana': fontstacks.verdana.stack.toString(),
        'verdana-foss': fontstacks['verdana-foss'].stack.toString(),
        'arial': fontstacks.arial.stack.toString(),
        'arial-foss': fontstacks['arial-foss'].stack.toString(),
        'times': fontstacks.times.stack.toString(),
        'times-foss': fontstacks['times-foss'].stack.toString(),
        'trebuchet': fontstacks.trebuchet.stack.toString(),
        'trebuchet-foss': fontstacks['trebuchet-foss'].stack.toString()
      },
      sourceMaps: true
    }),

    // Vendor prefix properties
    prefix('last 2 version'),

    // Optimize css with [Comb]()
    csscomb(csscomb_options),
    rename(pkg.name + '-' + pkg.version + '.css'),
    gulp.dest('./dist/'),

    rename(pkg.name + '-' + pkg.version + '.min.css'),

    // Minify with [CSSO]()
    // Structural optimizations
    // @see http://bem.info/tools/optimizers/csso/description/ section1.2
    minify(false),
    gulp.dest('./dist/')

  );

  combined.on('error', function(err) {
    gutil.log(err.message);
  });

  return combined;
});

// Deploy X catalog to X branch (usually gh-pages)
gulp.task('deploy', function() {
  gulp.src('./dist/*')
  .pipe(deploy(deployOptions));
});

gulp.task('default', ['stylesheet', 'example']);
