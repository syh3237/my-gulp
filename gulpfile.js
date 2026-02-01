const gulp = require('gulp');
const ejs = require('gulp-ejs');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const frontMatter = require('gulp-front-matter');
const gulpData = require('gulp-data');
const mergeStream = require('merge-stream');
const fs = require('fs');
const path = require('path');

// 페이지 메타데이터를 수집하는 함수
function collectPages() {
  const pagesDir = './src/views/pages';
  const pages = [];
  const categories = {};

  function scanDirectory(dir, category = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 하위 카테고리 스캔
        scanDirectory(fullPath, item);
      } else if (item.endsWith('.ejs')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const relativePath = path.relative(pagesDir, fullPath);
        const filePath = relativePath.replace(/\\/g, '/').replace(/\.ejs$/, '.html');
        
        // 페이지 제목 추출 (front matter 또는 주석에서)
        let title = path.basename(item, '.ejs');
        let pageCategory = category;
        
        // Front matter에서 제목 추출
        const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
        if (frontMatterMatch) {
          const frontMatterContent = frontMatterMatch[1];
          const titleMatch = frontMatterContent.match(/title:\s*(.+)/);
          const categoryMatch = frontMatterContent.match(/category:\s*(.+)/);
          if (titleMatch) title = titleMatch[1].trim();
          if (categoryMatch) pageCategory = categoryMatch[1].trim();
        } else {
          // 주석에서 제목 추출 (<!-- title: 페이지 제목 -->)
          const commentMatch = content.match(/<!--\s*title:\s*(.+?)\s*-->/);
          if (commentMatch) title = commentMatch[1].trim();
        }
        
        if (!pageCategory) pageCategory = '기타';
        
        if (!categories[pageCategory]) {
          categories[pageCategory] = [];
        }
        
        categories[pageCategory].push({
          title: title,
          path: filePath,
          filename: item.replace(/\.ejs$/, '.html')
        });
      }
    });
  }
  
  if (fs.existsSync(pagesDir)) {
    scanDirectory(pagesDir);
  }
  
  return categories;
}

// HTML 처리 (EJS 템플릿 컴파일)
function html() {
  const categories = collectPages();
  
  // index.ejs 처리
  const indexStream = gulp.src('src/views/index.ejs')
    .pipe(gulpData(() => ({ categories })))
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest('dist'));
  
  // pages 폴더의 EJS 파일들 처리
  const pagesStream = gulp.src('src/views/pages/**/*.ejs')
    .pipe(frontMatter({
      property: 'data',
      remove: true
    }))
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest('dist/pages'));
  
  return mergeStream(indexStream, pagesStream)
    .pipe(browserSync.stream());
}

// SCSS 컴파일
function styles() {
  return gulp.src('src/css/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
}

// JS 처리
function scripts() {
  return gulp.src('src/js/**/*.js')
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
}

// 정적 파일 복사
function assets() {
  return gulp.src('src/assets/**/*')
    .pipe(gulp.dest('dist/assets'))
    .pipe(browserSync.stream());
}

// 빌드 태스크
const build = gulp.parallel(html, styles, scripts, assets);

// 개발 서버
function serve() {
  browserSync.init({
    server: {
      baseDir: './dist'
    },
    port: 3000
  });
  
  gulp.watch('src/views/**/*.ejs', html);
  gulp.watch('src/css/scss/**/*.scss', styles);
  gulp.watch('src/js/**/*.js', scripts);
  gulp.watch('src/assets/**/*', assets);
}

// 기본 태스크
exports.default = gulp.series(build, serve);
exports.build = build;
exports.serve = serve;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
