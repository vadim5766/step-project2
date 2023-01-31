import gulp from "gulp";
const { src, dest, watch, series, parallel } = gulp;
import autoprefixer from "gulp-autoprefixer";
import browserSync from "browser-sync";
const bsServer = browserSync.create();
import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);
import uglify from "gulp-uglify";
import rename from "gulp-rename";
import concat from "gulp-concat";
import imagemin from "gulp-imagemin";
import csso from "gulp-csso";
import { deleteAsync } from "del";

function serve() {
  bsServer.init({
    server: {
      baseDir: "./",
    },
  });
}

function styles() {
  return src("./src/scss/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true,
      })
    )
    .pipe(dest("./dist/css/"))
    .pipe(csso())
    .pipe(
      rename({
        basename: "style.min",
        extname: ".css",
      })
    )
    .pipe(dest("./dist/css/"))
    .pipe(bsServer.reload({ stream: true }));
}

function js() {
  return src("./src/js/**/*.js")
    .pipe(concat("index.js"))
    .pipe(dest("./dist/js/"))
    .pipe(uglify())
    .pipe(
      rename({
        basename: "index.min",
        extname: ".js",
      })
    )
    .pipe(dest("./dist/js/"))
    .pipe(bsServer.reload({ stream: true }));
}

function img() {
  return src("./src/img/**/*.{jpg,jpeg,webp,svg,png}")
    .pipe(imagemin())
    .pipe(dest("./dist/img/"))
    .pipe(bsServer.reload({ stream: true }));
}

function watcher() {
  watch("./src/scss/**/*.scss", styles);
  watch("./src/js/**/*.js", js);
  watch("./src/img/**/*.{jpg,jpeg,webp,svg,png}", img);
  watch("*.html").on("change", bsServer.reload);
}

function cleanDist() {
  return deleteAsync("./dist/");
}

export const build = series(cleanDist, parallel(styles, js, img));
export const dev = series(build, parallel(serve, watcher));
