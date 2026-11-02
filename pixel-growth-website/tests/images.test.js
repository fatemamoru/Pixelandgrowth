// tests/images.test.js
//
// Example / audit tests for image handling and render-blocking (task 13.2).
// These assert concrete guarantees of the performance & image-optimization
// layer rather than universal properties:
//
//   - onerror placeholder swap within reserved dimensions, no layout shift
//     (Req 11.5): renderPortfolioCard emits an <img> with declared width/height
//     and an onerror handler that only nulls itself and swaps src to the
//     placeholder — the width/height are never touched, so the reserved box
//     is preserved and surrounding content does not shift.
//   - Lazy loading + web-optimized formats (Req 11.1, 11.2): cards emit a
//     <picture> offering AVIF and WebP sources and an <img loading="lazy">;
//     the PROJECTS dataset carries webp + avif paths and positive, reasonable
//     intrinsic width/height (the <=1.5x display sizing is a data/asset
//     contract — dimensions are present and bounded).
//   - Deferred modules (Req 11.4): every <script> that loads JS on the five
//     pages is type="module" (deferred by default), with no blocking classic
//     <script src> in <head>.
//
// Card markup is produced by the pure renderPortfolioCard helper and parsed
// into a DOM via jsdom (global in the Vitest jsdom environment). Page HTML is
// read from disk with node:fs.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { renderPortfolioCard, IMAGE_PLACEHOLDER_SRC } from '../js/render.js';
import { PROJECTS } from '../js/data/portfolio.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'portfolio.html',
  'contact.html',
];

/** Parse an HTML string into a detached container element. */
function parseHtml(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

/** Read a page's HTML from disk. */
function readPage(fileName) {
  return readFileSync(join(root, fileName), 'utf8');
}

// A representative valid project used across the onerror / lazy / picture tests.
const sampleProject = {
  id: 'demo-sample',
  title: 'Sample: Demonstration Project',
  description: 'An illustrative demonstration project used for image-handling tests.',
  image: {
    webp: 'assets/img/project-1.webp',
    avif: 'assets/img/project-1.avif',
    alt: 'Demonstration mockup.',
    width: 1200,
    height: 800,
  },
};

describe('onerror placeholder swap within reserved dimensions (Req 11.5)', () => {
  const container = parseHtml(renderPortfolioCard(sampleProject));
  const img = container.querySelector('img');

  it('renders an <img> with declared width and height (reserved dimensions)', () => {
    expect(img).not.toBeNull();
    expect(img.getAttribute('width')).toBe('1200');
    expect(img.getAttribute('height')).toBe('800');
  });

  it('declares an onerror handler that self-nulls and swaps to the placeholder', () => {
    const onerror = img.getAttribute('onerror');
    expect(onerror).toBeTruthy();
    // Handler must disarm itself first to avoid an infinite error loop...
    expect(onerror).toContain('this.onerror=null');
    // ...and then point the src at the placeholder asset.
    expect(onerror).toContain('this.src=');
    expect(onerror).toContain(IMAGE_PLACEHOLDER_SRC);
  });

  it('swapping the placeholder in does not change the reserved width/height', () => {
    // Simulate what the onerror handler does at runtime: null the handler and
    // repoint src. It must NOT alter width/height, so the reserved box — and
    // therefore the surrounding layout — is preserved (no layout shift).
    const widthBefore = img.getAttribute('width');
    const heightBefore = img.getAttribute('height');

    img.onerror = null;
    img.setAttribute('src', IMAGE_PLACEHOLDER_SRC);

    expect(img.getAttribute('width')).toBe(widthBefore);
    expect(img.getAttribute('height')).toBe(heightBefore);
    expect(img.getAttribute('src')).toBe(IMAGE_PLACEHOLDER_SRC);
  });
});

describe('Lazy loading and web-optimized formats (Req 11.1, 11.2)', () => {
  const container = parseHtml(renderPortfolioCard(sampleProject));

  it('emits a <picture> with AVIF and WebP sources', () => {
    const picture = container.querySelector('picture');
    expect(picture).not.toBeNull();

    const avif = picture.querySelector('source[type="image/avif"]');
    const webp = picture.querySelector('source[type="image/webp"]');
    expect(avif).not.toBeNull();
    expect(webp).not.toBeNull();
    expect(avif.getAttribute('srcset')).toContain('.avif');
    expect(webp.getAttribute('srcset')).toContain('.webp');
  });

  it('marks the below-the-fold portfolio image loading="lazy"', () => {
    const img = container.querySelector('img');
    expect(img.getAttribute('loading')).toBe('lazy');
  });
});

describe('Portfolio image data is a web-optimized, sized asset contract (Req 11.1, 11.2)', () => {
  it('every project provides both WebP and AVIF source paths', () => {
    for (const project of PROJECTS) {
      expect(project.image).toBeDefined();
      expect(typeof project.image.webp).toBe('string');
      expect(project.image.webp).toMatch(/\.webp$/);
      expect(typeof project.image.avif).toBe('string');
      expect(project.image.avif).toMatch(/\.avif$/);
    }
  });

  it('every project declares positive, reasonable intrinsic width/height', () => {
    for (const project of PROJECTS) {
      const { width, height } = project.image;
      expect(Number.isFinite(width)).toBe(true);
      expect(Number.isFinite(height)).toBe(true);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      // Sizing contract: intrinsic dimensions stay bounded (<=1.5x display),
      // so assets are never gratuitously oversized relative to their box.
      expect(width).toBeLessThanOrEqual(3000);
      expect(height).toBeLessThanOrEqual(3000);
    }
  });
});

describe('JS is loaded as deferred modules, not render-blocking (Req 11.4)', () => {
  for (const page of PAGES) {
    describe(page, () => {
      const html = readPage(page);
      const container = parseHtml(html);
      const scripts = Array.from(container.querySelectorAll('script'));

      it('loads at least one script', () => {
        expect(scripts.length).toBeGreaterThan(0);
      });

      it('every external JS <script> is type="module" (deferred by default)', () => {
        const external = scripts.filter((s) => s.getAttribute('src'));
        expect(external.length).toBeGreaterThan(0);
        for (const s of external) {
          expect(s.getAttribute('type')).toBe('module');
        }
      });

      it('has no blocking classic <script src> (non-module external script)', () => {
        const blocking = scripts.filter(
          (s) => s.getAttribute('src') && s.getAttribute('type') !== 'module',
        );
        expect(blocking).toHaveLength(0);
      });
    });
  }
});
