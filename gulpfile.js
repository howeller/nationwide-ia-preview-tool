// Node & NPM packages
const fs = require('fs'),
	del = require('del'),
	merge = require('merge-stream'),
	path = require('path'),
	gulp = require('gulp'),
	gch = require('gulp-compile-handlebars'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	zip = require('gulp-zip');

// Custom modules & config
const util = require('./lib/fsUtils'),
	helper = require('./lib/hbHelpers');

// Directory paths
const dir = {
	assets:'./build/assets/',
	config:'./src/config.json',
	dist:'./build/html/',
	src:'./src/banners/',
	templates:'./src/templates/',
	previewTemplates:'preview/templates/',
	previewCache:'preview/templates_c/',
	previewCss:'../build/assets/css/',
	previewJs:'../build/assets/js/',
	localCss:'../../assets/css/',
	localJs:'../../assets/js/',
	localImages:'../../build/assets/images/',
	zips:'build/zips/'
}
const googleLib = {
	root:'https://s0.2mdn.net/creatives/assets/4087743/',
	fonts:'https://s0.2mdn.net/creatives/assets/2701989/',
	css:'',
	js:'https://s0.2mdn.net/creatives/assets/4087879/',
	logos:''
}
const srcFolders = util.getFolders(dir.src);
const useGoogleAssets = false; // Where to look for JS. Set true for final export. False for local testing.
const isDebugMode = true; // For testing unminified JS.

// Build names for each file
const getJsFileName = (obj) => `NW_IA_Animation_${obj.width}x${obj.height}`;//'NW_IA_Animation_'+obj.width+'x'+obj.height;
const getCssFileName = (obj) => `NW_IA_${obj.width}x${obj.height}.css`;

const getJsUrl = (_isPreview) => (_isPreview) ? dir.previewJs : useGoogleAssets ? googleLib.js : dir.localJs;
const getCssUrl = (_isPreview) => (_isPreview) ? dir.previewCss : useGoogleAssets ? googleLib.css : dir.localCss;
// const getImageUrl = (_isPreview) => (useGoogleAssets) ? googleLib.root : dir.localImages;
// const getLogoUrl = (_isPreview) => (useGoogleAssets) ? googleLib.logos : dir.localImages+'/logos/';


// Select path to asset library. Either use the Google Asset Library or one of the local repos
/*function getImageUrl(_isPreview){
	let localPreview = '../../assets/images/',// Relative path from inside preview site
		localSrc = '../../assets/images/';
	return (useGoogleAssets) ? googleLib.root : (_isPreview) ? localPreview : localSrc;
}*/


function build(_isPreview=false){
	console.log('*	BUILD-'+(_isPreview?' PREVIEW':'MAIN'));
	let task = srcFolders.map(function(folder) {
		let _src = path.join(dir.src, folder),
				_dist = (_isPreview) ? util.mkDirByPathSync(path.join(dir.previewTemplates, folder)) : util.mkDirByPathSync(path.join(dir.dist, folder)),
				_name = path.basename(folder),
				_config = JSON.parse(fs.readFileSync(dir.config)),
				_data = _config[_name],
				_htmlName = (_isPreview) ? 'index.html' : _name+'.html';

		_data['name'] = _name; // Store the folder name as a new JSON key/value. Avoids repeating the key name in JSON.
		_data['global'] = _config.global;

		// Configure gulp-compile-handlebars options
		const options = {
			ignorePartials:false,
			batch:[_src, dir.templates+'css', dir.templates+'html', dir.templates+'js', dir.templates+'svg'],
			helpers : {
				bannerCss : 				function(){ return `${name}_${this.width}x${this.height}.css`;},
				bannerAnimateJs : 	function(){ return `animation_${this.width}x${this.height}.js`;},
				getSvg : 						function(name){	return `${name}_${this.width}x${this.height}.svg`;},
				cssAssetURL: 				function(){ return getCssUrl(_isPreview);},
				jsAssetURL: 				function(){ return getJsUrl(_isPreview);},
				imageAssetURL: 			function(){ return (useGoogleAssets) ? googleLib.root : dir.localImages;},
				logoAssetURL: 			function(){ return (useGoogleAssets) ? googleLib.logos : dir.localImages+'/logos/';},
				// imageAssetURL: 			function(){ return getImageUrl(_isPreview);},
				// logoAssetURL: 			function(){ return getLogoUrl(_isPreview);},
				fontPath: 					function(){ return googleLib.fonts; },
				getStaticImagePath: function(){ return (_isPreview) ? './templates/'+this.name+'/images/' : 'images/';},
				invocationJs: 			function(){ return (_isPreview) ? 'invocationPreview.js':'invocation.js';},
				// mainJs: 			  		function(){ return (_isPreview) ? getJsFileName(this)+'.js':getJsFileName(this)+'.js';},//TESTING ONLY
				mainJs: 			  		function(){ return (_isPreview) ? getJsFileName(this)+'.js':getJsFileName(this)+'.min.js';},//PUT THIS BACK
				logoToUse: 					function(){ return this.logo.svg },
				isPreview: 					function(){ return (_isPreview) },
				getRibbonSlope: 		function(){ return getSlope(this.ribbon.x1, this.ribbon.x2, 0, this.ribbon.singleLineHeight)},
				getSlope: 					function(x1,y1,x2,y2){ return (y2 - y1) / (x2 - x1)},
				isSkyscraper: 			function(){ return this.height === 600 },
				isLeader: 					function(){ return this.width >= 728 }
			}
		}

		let _html = gulp.src(dir.templates+'/html/*.hbs')
			.pipe(gch(_data, options))
			.pipe(rename(_htmlName))
			.pipe(gulp.dest(_dist));

		if(_isPreview){
			let _clearCache = del(dir.previewCache+'**');

			return _html;
		}
		else {
			// let _cssName = 
			let _css = gulp.src(`${dir.templates}css/${getCssFileName(_data)}.hbs`)
				.pipe(gch(_data, options))
				.pipe(rename(getCssFileName(_data)))
				.pipe(gulp.dest(dir.assets+'css'));

			let _images = gulp.src(_src+'/images/**',{base:_src})// pipe "images" and contents
				.pipe(gulp.dest(_dist));

			let _js = gulp.src(dir.templates+'js/main.js.hbs')
				.pipe(gch(_data, options))
				.pipe(rename(getJsFileName(_data)+'.js'))
				.pipe(gulp.dest(dir.assets+'js'));

			return merge(_html, _css, _js, _images);
		}
	});
	let lastStream = task[task.length-1];
	return lastStream;
}

function getSlope(x1, x2, y1, y2){
	// Helper to print the slope of ribbon end angle
	// Slope (M) = (y2 - y1) / (x2 - x1)
	return (y2 - y1) / (x2 - x1);
}

function minifyJs(){
	let _js = [dir.assets+'js/*.js', '!'+dir.assets+'js/*.min.js'],
		_dest = dir.assets+'js';

	return gulp.src(_js)
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(_dest))
};

function zipFiles() {

	let task = srcFolders.map(function(folder) {
		let _dist = path.join(dir.dist, folder),
				_name = path.basename(folder);
				// _images = _dist+'/images/';

		return gulp.src([_dist+'/**/*'],{base:_dist})
			.pipe(zip(_name+'.zip'))
			.pipe(gulp.dest(dir.zips));

	});
	let lastStream = task[task.length-1];
	return lastStream;
};

// Gulp Tasks

gulp.task('clean:html', () => { return del([dir.dist+'/**/*', dir.assets+'js/*.js', dir.assets+'css/*.css', dir.previewTemplates+'/**/*']); });
gulp.task('clean:zips', () => { return del(dir.zips+'/**/*'); });
gulp.task('clean', gulp.parallel('clean:html', 'clean:zips'));
gulp.task('build:main', () => { return build(false);});
gulp.task('build:preview', () => { return build(true);});
gulp.task('build:all', gulp.series('build:main','build:preview'));
gulp.task('default', gulp.parallel('build:all'));
gulp.task('min', gulp.series('build:main', minifyJs));
gulp.task('watch', () => {gulp.watch([ dir.templates+'*/**', dir.assets+'/js/*.json', dir.config], gulp.series('build:all'))});
gulp.task('zip', gulp.series('build:main', minifyJs, zipFiles));
