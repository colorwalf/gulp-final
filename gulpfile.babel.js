'use strict'
//  套件定義
//  在package.json內引用的套件
//  npm install gulp --global

//  gulp / yarn run gulp


const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const connect = require('gulp-connect');
const imagemin = require('gulp-imagemin');
const spritesmith = require('gulp.spritesmith');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

const del = require('del');

//  ============================================================
//          變數定義，引入相關套件
//  ============================================================

const paths = {
    html:{
        src:'./*.html',
    },
    styles:{
        src:'./src/styles/index.scss',
        watch:'./src/styles/**/*.scss',
        dest:'build/css'
    },
    images:{
        src:'src/images/*',
        dest:'build/images'
    },
    webfonts:{
        src:'./src/fonts/*',
        dest:'build/font'
    },
    csssprite:{
        src:'src/sprite/*.png',
        dest:'build'
    },
    script:{
        src:'src/app/index.js',
        dest:'build/js'
    },
    venders:{
        script:{
            src: [
                'src/vender/jquery/dist/jquery-3.3.1.min.js',
                'src/vender/slider-pro/dist/js/jquery.sliderPro.js',
                'src/vender/magnific-popup/dist/jquery.magnific-popup.js',
            ],
            dest: 'build/js'
        },
        styles:{
            src:[
                'src/vender/slider-pro/dist/css/slider-pro.min.css',
                'src/vender/magnific-popup/dist/magnific-popup.css',
            ],
            dest: 'build/css'
        },
        images:{
            src: [
                'src/vender/**/*.gif',
                'src/vender/**/*.jpg',
                'src/vender/**/*.png',
                'src/vender/**/*.cur'
            ],
            dest: 'build/images'
        }
    }
};

const clean = () => del([ 'assets' ]);

//  ============================================================
//          工作 1 管理HTML
//  ============================================================


const buildHtml = async function (cb) {
    console.log('buildHtml');
    gulp.src(paths.html.src)
        .pipe(connect.reload());
    cb();
}


//  ============================================================
//          工作 2 編譯資產 SCSS
//  ============================================================


const buildSass = async function (cb) {
    console.log('buildSass');
    gulp.src(paths.styles.src)
        .pipe(gulpSass())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(connect.reload());
    cb();
}

//  ============================================================
//          工作 3 編譯資產 圖片
//  ============================================================


const compressImage = async function (cb) {
    console.log('compressImage');
    gulp.src(paths.images.src)
        .pipe(imagemin())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(connect.reload());
    cb();
}

//  ============================================================
//          工作 4 編譯資產 字型
//  ============================================================


const webFont = async function (cb) {
    console.log('webFont');
    gulp.src(paths.webfonts.src)
        .pipe(gulp.dest(paths.webfonts.dest))
        .pipe(connect.reload());
    cb();
}


//  ============================================================
//          工作 5 CSS Sprite 小圖示
//  ============================================================


const CSSSprite = async function (cb) {
    console.log('CSSSprite');
    gulp.src(paths.csssprite.src)
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css'
        }))
        .pipe(gulp.dest(paths.csssprite.dest))
        .pipe(connect.reload());
    cb();
}

//  ============================================================
//          工作 6 Javascript程式
//  ============================================================


const buildScript = async function (cb) {
    console.log('buildScript');
    gulp.src(paths.script.src)
        .pipe(concat('app.js'))
        .pipe(gulp.dest(paths.script.dest))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.script.dest))
        .pipe(connect.reload());
    cb();
};

//  ============================================================
//          工作 7 編譯外部套件 /JS/CSS/Image
//  ============================================================


const venderJS = async function (cb) {
    console.log('venderJS');
    gulp.src(paths.venders.script.src)
        .pipe(concat('venders.js'))
        .pipe(gulp.dest(paths.venders.script.dest))
        .pipe(rename('venders.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.venders.script.dest))
        .pipe(connect.reload());
    cb();
};


const venderCSS = async function (cb) {
    console.log('venderCss');
    gulp.src(paths.venders.styles.src)
        .pipe(concat('venders.css'))
        .pipe(gulp.dest(paths.venders.styles.dest))
        .pipe(rename('venders.min.css'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest(paths.venders.styles.dest))
        .pipe(connect.reload());
    cb();
}

const venderImage = async function (cb) {
    console.log('compressImage');
    gulp.src(paths.venders.images.src)
        .pipe(gulp.dest(paths.venders.images.dest))
        .pipe(connect.reload());
    cb();
}


//  ============================================================
//          工作 8 組合工作
//  ============================================================

const buildAssets = gulp.series(buildHtml, buildScript, buildSass, gulp.parallel(compressImage, webFont, CSSSprite));

const buildVenders = gulp.series(venderJS, gulp.parallel(venderCSS, venderImage));


//  ============================================================
//          工作 9 Watch監看程式
//  ============================================================


const watchFiles = async function () {
    gulp.watch(paths.html.src, buildHtml);    //build SASS
    gulp.watch(paths.styles.watch, buildSass);    //build SASS
    gulp.watch(paths.images.src, compressImage);
    gulp.watch(paths.webfonts.src, webFont);
    gulp.watch(paths.csssprite.src, CSSSprite);

    gulp.watch(paths.script.src, buildScript);

    gulp.watch(paths.venders.script.src, venderJS);
    gulp.watch(paths.venders.styles.src, venderCSS);
    gulp.watch(paths.venders.images.src, venderImage);

}

const webServer = async function () {
    console.log('start server');
    connect.server({
        livereload: true
    });
}


// gulp.watch('src/**/*.scss', { events: 'all' }, function(cb){
//     console.log('change SASS');
//     buildSass(cb);
//     cb();
// });.pipe(connect.reload())
// exports.default = buildSass;
exports.default = gulp.series(clean, gulp.parallel(buildAssets, buildVenders), webServer, watchFiles);