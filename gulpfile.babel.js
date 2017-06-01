'use strict';

import gulp         from 'gulp';
import buffer       from 'vinyl-buffer';
import source       from 'vinyl-source-stream';
import browserify   from 'browserify'; // allow the use of module imports into your js file
import autoprefixer from 'autoprefixer'; // automatically update css with relevant browser specific prefixes
import sass         from 'gulp-sass'; // automatically update css with relevant browser specific prefixes
import cssnano      from 'cssnano'; // compress CSS
import postcss      from 'gulp-postcss'; //
import sourcemaps   from 'gulp-sourcemaps'; // generate course maps for sass to css compilation
import plumber      from 'gulp-plumber'; // prevent pipes breaking and handle errors effectively
import uglify       from 'gulp-uglify'; // minify JS
import util         from 'gulp-util'; // log out useful errors to the console
import rename       from 'gulp-rename'; // rename our files

// Define the source directory and the destination directory
const paths = {
	js: {
		src: `js/`,
		dest: `dist/js/`
	},
	scss: {
		src: `scss/`,
		dest: `dist/css/`
	}
}
// This task will handle the babelifying of the JS and the uglifying.
gulp.task('es6', () => {
	//comment below line out in develpment;
	// process.env.NODE_ENV = 'production';
	return browserify(paths.js.src + 'main.js', {
		debug: false
	})
	.transform('babelify', { presets: ['es2015']})
	.on('error', (err) => { util.log(util.colors.red(err)); })
	.bundle()
	.pipe(source('main.js'))
	.pipe(buffer())
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(paths.js.dest));
});

// This task handles SCSS compatiblity.
gulp.task('sass', () => {
	return gulp.src(paths.scss.src + 'layout.scss')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(postcss(
			[
				autoprefixer({ browsers: ['last 3 versions', 'IE >= 9', 'iOS 6'] }),
				cssnano()
			]
		))
		.pipe(rename({suffix: '.min'}))
		.pipe(plumber.stop())
		.pipe(sourcemaps.write('maps/'))
		.pipe(gulp.dest(paths.scss.dest));
});

// Create a build task
gulp.task('build', ['es6', 'sass']);

// This is the default task that runs on gulp start. It also initiates all of our watch tasks.
gulp.task('default', ['build'], () => {
	gulp.watch(paths.js.src + '**/*.js', ['es6']);
	gulp.watch(paths.scss.src + '**/*.scss', ['sass']);
});
