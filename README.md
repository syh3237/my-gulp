# Gulp 프로젝트

Gulp를 사용한 정적 사이트 빌드 프로젝트입니다.

## 프로젝트 구조

```
gulp-cs/
├── src/
│   ├── views/
│   │   ├── pages/          # 페이지 파일들
│   │   └── include/         # 공통 include 파일 (head, header, footer)
│   ├── css/
│   │   └── scss/           # SCSS 스타일 파일
│   ├── js/                 # JavaScript 파일
│   └── assets/             # 정적 파일 (이미지 등)
├── dist/                   # 빌드 결과물
├── gulpfile.js
└── package.json
```

## 설치

```bash
npm install
```

## 사용법

### 개발 모드 (자동 새로고침)
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 페이지 추가 방법

1. `src/views/pages/` 폴더에 HTML 파일을 생성합니다.
2. 파일 상단에 Front Matter 형식으로 제목과 카테고리를 정의합니다:

```html
---
title: 페이지 제목
category: 카테고리명
---
<!DOCTYPE html>
...
```

또는 주석 형식으로도 가능합니다:

```html
<!-- title: 페이지 제목 -->
<!DOCTYPE html>
...
```

3. 페이지는 자동으로 index.html에 카테고리별로 리스팅됩니다.

## 카테고리별 분류

페이지는 `category` 필드에 따라 h2 태그로 분류되어 표시됩니다. 카테고리가 없는 경우 "기타" 카테고리에 포함됩니다.
