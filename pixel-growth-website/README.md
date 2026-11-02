# Pixel & Growth Website

A five-page static marketing website built with plain **HTML5 + CSS3 (custom properties) + vanilla JavaScript (ES modules)**. There is **no build step, no framework, and no paid service** — nothing is compiled. The files you edit are the files that ship.

## Running the site locally

Because the pages load JavaScript as ES modules, opening the HTML files directly with `file://` is blocked by CORS in some browsers. Serve the folder over a **no-cost local static server** instead. Pick whichever is easiest for you:

### Option A — Python's built-in server (no install if Python is present)

```bash
# from the pixel-growth-website/ directory
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser. (On some systems use `python3` instead of `python`.)

### Option B — VS Code Live Server

1. Install the free **Live Server** extension in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.
3. The site opens in your browser, auto-reloading on save.

Both options are free and require no account, domain, or host.

## Running the tests

Tests use [Vitest](https://vitest.dev) with the [jsdom](https://github.com/jsdom/jsdom) environment (for DOM/markup assertions), [fast-check](https://fast-check.dev) for property-based tests, and [axe-core](https://github.com/dequelabs/axe-core) for accessibility audits. These are **dev dependencies only** — they are never shipped to the live site.

Install the dev dependencies once:

```bash
npm install
```

Then run the full suite in single-run mode (not watch mode):

```bash
npm test
```

This runs `vitest --run`, executes every test file under `tests/`, and exits.

## Project structure

```
pixel-growth-website/
├── *.html        # the five pages
├── css/          # tokens.css (single source of palette/fonts), base.css, components.css
├── js/           # components, data, pure logic (validation, render, seo), page scripts
├── assets/       # self-hosted fonts, logo, optimized images
└── tests/        # Vitest test files
```
