var gulp = require('gulp');
var watch = require('gulp-watch');
var rename = require("gulp-rename");
var pug = require('gulp-pug');
var stylus = require('gulp-stylus');
let sass = require('gulp-sass');
// var sourcemaps = require('gulp-sourcemaps');
var server = require('gulp-server-livereload');
var yargs = require('yargs');
var fs = require('fs');
const imagemin = require('gulp-imagemin');
const imageminGuetzli = require('imagemin-guetzli');
const pngquant = require('gulp-pngquant');
const ghPages = require('gulp-gh-pages');




var config = null;

var io = new function() {
	this.readSync = file => {
		return fs.readFileSync(file, { encoding : 'utf8' });
	}
	this.read = file => {
		return new Promise( (resolve, reject) => {
			fs.readFile(file, 'utf8', (err, data) => {
				if ( err ) reject(new Error(data));
				resolve(data);
			});
		});
	}
	this.readJSON = file => {
		return this.read(file)
			.then( data => {
				var obj = JSON.parse(data);
				return Promise.resolve(obj);
			});
	}
	this.readCSV = file => {
		return this.exists(file)
			.then( () => {
				return this.read(file);
			})
			.then( data => {
				var obj = csvjson.toObject(data, { delimiter: ';' });
				return Promise.resolve(obj);
			});
	}
	this.save = (file, data) => {
		var idx = file.lastIndexOf('/');
		var dir = file.slice(0, idx);
		return new Promise( (resolve, reject) => {
			mkdirp(dir, err => {
				if ( err ) reject(new Error(`Couldn't create directory: ${dir}: ${err.message}`));
				else resolve();
			});
		})
		.then( () => {
			return new Promise( (resolve, reject) => {
				fs.writeFile(file, data, err => {
					if ( err ) reject(new Error(`Error writing file: ${file}: ${err}`));
					else resolve();
				});
			});			
		})
		.catch( err => {
			console.log(err.message);
			return Promise.rejected();
		});							
	}
	this.exists = fsobj => {
		return new Promise( (resolve, reject) => {
			fs.access(fsobj, err => {
				if ( err ) reject(new Error(err));
				else resolve();
			});
		});
	}
	this.copy = (glob, base, destDir, basename) => {
		return new Promise(
			(resolve, reject) => {
				gulp.src(glob, { base: base })
					.pipe(rename(
						file => {
							if ( basename ) file.basename = basename;
					}))
					.pipe(gulp.dest(destDir))
					.on('error', reject)
					.on('end', resolve);
			})
			.catch( err => {
				console.log(err);
				return Promise.resolve();
			})
	}
	this.getRelativePath = (filepath, base) => {
		var path = filepath.replace(/\\/g, '/');
		var idx = path.indexOf(base);
		var relativePath = path.slice(idx + base.length + 1, path.lastIndexOf('/'));
		return relativePath;
	}
}


class Bootstrapper 	{
	constructor() {
		this.cache = {};
	}
	get router() {
		if ( this.cache.router ) return this.cache.router;
		return this.cache.router = Router.create();
	}
	static create() {
		return new Bootstrapper();
	}
}

class Router {
	constructor(defaults, projectSettings) {
		this.codename = projectSettings.codename;
		this.srcPath = `${defaults.srcPath}/${projectSettings.codename}`;
		this.srcMarkupPath = `${this.srcPath}/markup`;
		this.srcAssetsPath = `${this.srcPath}/assets`;
		
		this.buildPath = projectSettings.customBuildPath ?
			`${defaults.buildPath}/${projectSettings.customBuildPath}` :
			`${defaults.buildPath}/${projectSettings.codename}`;

		this.dstAssetsPath = projectSettings.customAssetsDir ?
			`${this.buildPath}/${projectSettings.customAssetsDir}` :
			`${this.buildPath}/assets`;

		this.dstStylesPath = projectSettings.customStylesDir ?
			`${this.dstAssetsPath}/${projectSettings.customStylesDir}` :
			`${this.dstAssetsPath}/css`;
	}

	static create() {
		let defaults, projectSettings;
		let markerFile = `${__dirname}/current.json`;
		projectSettings = require(markerFile);
		let configFile = `${__dirname}/config.json`;
		defaults = require(configFile);
		let projectSettingsFile = `${__dirname}/${defaults.srcPath}/${projectSettings.codename}/config.json`;
		try {
			let data = require(projectSettingsFile);
			projectSettings = Object.assign(projectSettings, data);
		}
		catch ( e ) {
			console.log(e.message);
		}
		return new Router(defaults, projectSettings);
	}
}

gulp.task('init', () => {
	let bs = Bootstrapper.create();
	console.log(bs.router);
});


gulp.task('watch', (cb) => {

	let bs = Bootstrapper.create();
	// console.log(bs.router);

	watch(`${bs.router.srcMarkupPath}/*.py.pug`, (changedFile) => {
		console.log(`Changed: ${changedFile.path}`);
		compilePages(`${bs.router.srcMarkupPath}/*.py.pug`, bs.router.buildPath);
	});

	let globSrcStyles = `${bs.router.srcMarkupPath}/*.styl`;
	watch(globSrcStyles, (changedFile) => {
		console.log(`Changed: ${changedFile.path}`);
		compileStyles(changedFile.path, bs.router.dstStylesPath)
	});

	watch(`${bs.router.srcAssetsPath}/js/*.js`, (changedFile) => {
		console.log(`Changed: ${changedFile.path}`);
		io.copy(changedFile.path, `${bs.router.srcAssetsPath}/js/`, `${bs.router.dstAssetsPath}/js`);
	});

	cb();
	
	//	let base = bs.router.srcAssetsPath;
	//	watch(`${bs.router.srcAssetsPath}/**/*`, (changedFile) => {
	//		// let relativePath = io.getRelativePath(changedFile.path, bs.router.srcAssetsPath);
	//		console.log(`Changed: ${changedFile.path}`);
	//		io.copy(changedFile.path, bs.router.srcAssetsPath, bs.router.dstAssetsPath);
	//	});
	
});


gulp.task('develop', gulp.parallel('watch', () => {

	let bs = Bootstrapper.create();
	console.log(bs.router);

	compilePages(`${bs.router.srcMarkupPath}/*.py.pug`, `${bs.router.buildPath}`);
	compileStyles(`${bs.router.srcMarkupPath}/*.styl`, `${bs.router.dstStylesPath}`);
	// io.copy(`${bs.router.srcAssetsPath}/**/*`, bs.router.srcAssetsPath, bs.router.dstAssetsPath);

	gulp.src(bs.router.buildPath)
		.pipe(server({
			livereload: true,
			open: true,
			directoryListing: {
	            enable: true,
	            path: bs.router.buildPath
	        }
		}));
}));

gulp.task('default', gulp.series('develop', () => {
	// "__build" folder should be created manually
}));

function compilePages(glob, dest) {
	gulp.src(glob)
		.pipe(pug({ locals: { data: null }, pretty: true }))  
		.pipe(rename(function (path) {
		 	path.basename = path.basename.slice(0, -3);
		}))
		.pipe(gulp.dest(dest));
}

function compileStyles(glob, dest) {
	gulp.src(glob)
		// .pipe(sourcemaps.init())
		.pipe(stylus())
		// .pipe(sourcemaps.write())
		.pipe(gulp.dest(dest));
}




gulp.task('images', () => {
	let bs = Bootstrapper.create();
	return Promise.all([
		new Promise( (resolve, reject) => {
			gulp.src(`${bs.router.srcAssetsPath}/*.jpg`)
				.pipe(imagemin([
			    	imageminGuetzli({
				        quality: 85
				    })
				]))
				.pipe(gulp.dest(bs.router.dstAssetsPath))
				.on('end', resolve);
		}),
		new Promise( (resolve, reject) => {	
			gulp.src(`${bs.router.srcAssetsPath}/*.png`)
				.pipe(pngquant(			{
					quality: '65-80'
				}))
				.pipe(gulp.dest(bs.router.dstAssetsPath))
				.on('end', resolve);
		})
	]);
});




gulp.task('switch', function() {

	var argv = yargs
		.demandOption(['p'])
		.nargs('p', 1)
		.describe('p', 'project directory')
		.usage('Usage: gulp switch -p <dirname>')
		.example('gulp switch -p new_makeup', 'create a new directory')
		.help('help')
		.wrap(79)
		.argv;


	let config = require('./config');
	let projectSrcDir = `${config.srcPath}/${argv.p}`;
	if ( !fs.existsSync(projectSrcDir) ) {
		console.log('No such directory: ' + projectSrcDir);
		return false;
	}

	var settings = {
		codename: argv.p
	}
	var settings_json = JSON.stringify(settings);
	fs.writeFile('./current.json', settings_json, () => {
		console.log('Switched to ' + settings.codename);
	});
});

gulp.task('bootstrap', () => {
	let bs = Bootstrapper.create();
	return gulp.src(`${bs.router.srcPath}/bootstrap-vpl.scss`)
	    .pipe(sass().on('error', sass.logError))
	    .pipe(gulp.dest(bs.router.dstStylesPath));
});

// gulp.task('deploy', () => {
//   return gulp.src('./../htdocs/**/*')
//     .pipe(ghPages());
// });
