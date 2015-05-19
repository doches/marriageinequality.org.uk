var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var coffee = require('gulp-coffee');
var less = require('gulp-less');
var path = require('path');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var gutil = require('gutil');
var rename = require("gulp-rename");
var bowerFiles = require('main-bower-files');
var inject = require('gulp-inject');
var es = require('event-stream');
var optipng = require('gulp-optipng');
var gulpFilter = require('gulp-filter');
var uglify = require('gulp-uglify');

// Compile less into CSS
gulp.task('less', function () {
  return gulp.src(['./src/**/*.less'])
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(rename({dirname: ""}))
    .pipe(gulp.dest('./build/styles/'))
    .pipe(reload({stream: true}));
});

// Compile coffeescript into Javascript
gulp.task('coffee', function() {
  return gulp.src(['./src/**/*.coffee'])
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(rename({dirname: ""}))
    .pipe(gulp.dest('./build/scripts/'));
});

// Compile handlebars templates into Javascript
gulp.task('templates', function(){
  return gulp.src(['./src/**/*.handlebars'])
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'Templates',
      noRedeclare: true, // Avoid duplicate declarations
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('./build/scripts/'));
});

// Copy pre-compiled resources (JS and CSS)
gulp.task('copy-js', function() {
  gulp.src(['./src/**/*.js'])
    .pipe(rename({dirname: ""}))
    .pipe(gulp.dest('./build/scripts'));
  gulp.src(['./src/**/*.css'])
    .pipe(rename({dirname: ""}))
    .pipe(gulp.dest('./build/styles'));
});

// Inject compiled CSS and JS into html
gulp.task("html", function() {
  return gulp.src('./src/*.html')
    .pipe(inject(
      gulp.src(bowerFiles(), {read: false}), {
        name: 'bower',
        ignorePath: 'bower_components/'
      }))
    .pipe(inject(
      gulp.src(['./**/*.js', './**/*.css'], {read: false, cwd: './build'}), {
        ignorePath: 'build/'
      }))
    .pipe(gulp.dest('./build'));
});

// Copy images, optimising PNGs
gulp.task("image", function() {
  var pngFilter = gulpFilter('**/*.png');

  gulp.src('./src/img/*')
    .pipe(gulp.dest('./build/img/'));
});

gulp.task('dev', ['build', 'serve-dev']);

gulp.task("dist", ["build", "make-release"]);

gulp.task("build", ["coffee", "less", "templates", "html", "image", "copy-js"]);

gulp.task("make-release", function() {
  // App scripts
  gulp.src("./build/scripts/*.js")
    .pipe(concat('compiled.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/scripts/'));
  // App styles
  gulp.src("./build/styles/*.css")
    .pipe(concat('compiled.css'))
    .pipe(gulp.dest('./dist/styles/'));
  // App images
  gulp.src('./build/img/*')
    .pipe(gulp.dest('./dist/img/'));

  // Bower scripts
  gulp.src(bowerFiles())
    .pipe(gulpFilter('**/*.js'))
    .pipe(concat('third-party.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/scripts/third-party/'))
  // Bower styles
  gulp.src(bowerFiles())
    .pipe(gulpFilter('**/*.css'))
    .pipe(concat('third-party.css'))
    .pipe(gulp.dest('./dist/styles/third-party/'))

  // HTML
  gulp.src('./src/*.html')
    .pipe(inject(
      gulp.src(['./scripts/*.js', './styles/*.css'], {read: false, cwd: './dist'}), {
        ignorePath: '../dist/',
        relative: true
      }))
    .pipe(gulp.dest('./dist'));
  // HTML AGAIN, to include third-party resources
  gulp.src('./dist/*.html')
    .pipe(inject(
      gulp.src(['./scripts/third-party/*.js', './styles/third-party/*.css'], {read: false, cwd: './dist'}), {
        ignorePath: '../dist/',
        relative: true,
        name: 'bower'
      }))
    .pipe(gulp.dest('./dist'));
});

// Watch all source files for changes
gulp.task('serve-dev', function() {
  gulp.watch(['src/**/*.coffee'], ['coffee']);
  gulp.watch(['src/**/*.less'], ['less']);
  gulp.watch(['src/**/*.handlebars'], ['templates']);
  gulp.watch(['src/*.html'], ['html']);
  gulp.watch(['src/img/*'], ['image']);
  gulp.watch(['src/**/*.css', 'src/**/*.js'], ['copy-js']);

    // Reload browser-sync on change
  browserSync.init({
    server: {
      baseDir: ["./build", "./bower_components"]
    }
  });

  gulp.watch(['./build/*.html', './build/scripts/*.js', './build/img/*']).on('change', function(e) {
    console.log(e.type + ": " + e.path);
    reload();
  });
});
