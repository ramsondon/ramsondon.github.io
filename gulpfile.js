let gulp = require('gulp');
let less = require('gulp-less');
let browserSync = require('browser-sync').create();
let header = require('gulp-header');
let cleanCSS = require('gulp-clean-css');
let rename = require("gulp-rename");
let concat = require("gulp-concat");
let uglify = require('gulp-uglify');
let filter = require('gulp-filter');
let pkg = require('./package.json');

// Set the banner content
let banner = ['/*!\n',
    ' * ramsondon.github.io - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2024 -' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %>\n',
    ' */\n',
    ''
].join('');

// Compile LESS files from /less into /css
gulp.task('less', function() {
    let f = filter(['**', '!**/mixins.less', '!**/variables.less', '!**/navbar.less', '!**/custom.bootstrap.less']);
    return gulp.src('src/less/*.less')
        .pipe(f)
        .pipe(less().on('error', function(err) {
			console.log(err);
		}))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('src/css'))
        // .pipe(browserSync.reload({
        //     stream: true
        // }))
});

// Minify compiled CSS
gulp.task('minify-css', gulp.series('less', function() {
    return gulp.src('src/css/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('web/css'))
        // .pipe(browserSync.reload({
        //     stream: true
        // }))
}));

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('web/js'))
        // .pipe(browserSync.reload({
        //     stream: true
        // }))
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
    return gulp.src(['node_modules/xng/dist/xng.min.js']).pipe(gulp.dest('vendor/xng'))
    // gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
    //     .pipe(gulp.dest('vendor/bootstrap'))
	//
    // gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
    //     .pipe(gulp.dest('vendor/jquery'))
	//
    // gulp.src([
    //         'node_modules/font-awesome/**',
    //         '!node_modules/font-awesome/**/*.map',
    //         '!node_modules/font-awesome/.npmignore',
    //         '!node_modules/font-awesome/*.txt',
    //         '!node_modules/font-awesome/*.md',
    //         '!node_modules/font-awesome/*.json'
    //     ])
    //     .pipe(gulp.dest('vendor/font-awesome'))
});

// Run everything
gulp.task('default', gulp.series('less', 'minify-css', 'minify-js', 'copy'));

// Configure the browserSync task
// gulp.task('browserSync', function() {
//     browserSync.init({
//         server: {
//             baseDir: ''
//         },
//     })
// });

// Dev task with browserSync
// gulp.task('dev', gulp.series('less', 'minify-css', 'minify-js'), async function() {
//     gulp.watch('src/less/*.less', ['less']);
//     gulp.watch('src/css/*.css', ['minify-css']);
//     gulp.watch('src/js/*.js', ['minify-js']);
//     gulp.watch('web/data/*.json');
//     // Reloads the browser whenever HTML or JS files change
//     // gulp.watch('*.html', browserSync.reload);
//     // gulp.watch('web/js/**/*.js', browserSync.reload);
// });
