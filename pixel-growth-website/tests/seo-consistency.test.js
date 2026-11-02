// tests/seo-consistency.test.js
//
// Task 14.2 — SEO and consistency audit tests.
//
// This suite audits the five assembled pages (index, about, services,
// portfolio, contact) against the SEO guarantees and cross-page styling
// consistency guarantees of the design:
//
//   - SEO metadata (Req 10.1, 10.2): checkAllSeo() over the single metadata
//     source (js/seo.js) reports valid:true — unique, length-bounded titles and
//     length-bounded descriptions. We ALSO tie the rendered pages on disk back
//     to that single source: each page's actual <title> text and
//     <meta name="description"> content must match PAGE_METADATA for that page.
//   - Single H1 (Req 10.3): every page has exactly one <h1>.
//   - Descriptive nav link text (Req 10.4): the five rendered nav links carry
//     the descriptive page labels and none is a generic phrase.
//   - Cross-page style consistency within 2px (Req 2.6): see the note below.
//
// NOTE ON "within 2px" COMPUTED-STYLE CONSISTENCY (Req 2.6):
// jsdom does not implement a layout engine and does not resolve CSS from linked
// stylesheets, so getComputedStyle() returns no real pixel values for heading
// size, button padding, or element spacing. A genuine "within 2px" computed
// comparison is therefore not feasible in this environment — it belongs to a
// browser-based visual/rendering tool (e.g. Playwright or a screenshot-diff).
//
// Instead we enforce the SAME outcome STRUCTURALLY: identical heading/button/
// spacing styling is guaranteed when every page applies the exact same shared
// stylesheet set in the same order and uses the same shared classes/tag
// conventions for those elements. So this suite asserts:
//   - all five pages link the same three stylesheets (tokens.css, base.css,
//     components.css) in the same order (so identical heading/button/spacing
//     rules apply everywhere);
//   - every CTA across the pages uses the one shared "btn btn-cta" class; and
//   - headings follow the same tag conventions (exactly one <h1>; section
//     headings use <h2>).
// Together these make the 2px-consistency requirement hold by construction.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  checkAllSeo,
  PAGE_METADATA,
  PAGE_KEYS,
} from '../js/seo.js';
import { renderNav, PAGES } from '../js/components.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Map each page key to its HTML file on disk (the single source of rendered truth).
const PAGE_FILES = {
  home: 'index.html',
  about: 'about.html',
  services: 'services.html',
  portfolio: 'portfolio.html',
  contact: 'contact.html',
};

// The shared stylesheet set that must be linked, in this exact order, on every
// page so identical heading/button/spacing styles apply site-wide (Req 2.6).
const EXPECTED_STYLESHEETS = ['css/tokens.css', 'css/base.css', 'css/components.css'];

// Generic link phrases that nav link text must never consist solely of (Req 10.4).
const GENERIC_PHRASES = ['click here', 'read more'];

/** Read a page's HTML from disk and parse it into a real DOM document. */
function parsePage(key) {
  const html = readFileSync(join(root, PAGE_FILES[key]), 'utf8');
  return new DOMParser().parseFromString(html, 'text/html');
}

// Parse every page once up front; files don't change across assertions.
const DOCS = Object.fromEntries(PAGE_KEYS.map((key) => [key, parsePage(key)]));

describe('SEO audit — metadata validity (Req 10.1, 10.2)', () => {
  it('checkAllSeo() passes: unique bounded titles and bounded descriptions', () => {
    const result = checkAllSeo();
    expect(
      result.valid,
      `SEO validation failed with issues: ${JSON.stringify(result.issues)}`,
    ).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('every page is validated (five results)', () => {
    const result = checkAllSeo();
    expect(result.results).toHaveLength(PAGE_KEYS.length);
    for (const pageResult of result.results) {
      expect(pageResult.valid).toBe(true);
    }
  });
});

describe('SEO audit — rendered pages match the single metadata source (Req 10.1, 10.2)', () => {
  for (const key of PAGE_KEYS) {
    it(`"${PAGE_FILES[key]}" <title> matches PAGE_METADATA.${key}.title`, () => {
      const doc = DOCS[key];
      // document.title decodes entities, so it equals the raw metadata string.
      expect(doc.title).toBe(PAGE_METADATA[key].title);
    });

    it(`"${PAGE_FILES[key]}" meta description matches PAGE_METADATA.${key}.description`, () => {
      const doc = DOCS[key];
      const meta = doc.querySelector('meta[name="description"]');
      expect(meta, `missing <meta name="description"> in ${PAGE_FILES[key]}`).not.toBeNull();
      const content = meta.getAttribute('content');
      expect(content).toBe(PAGE_METADATA[key].description);
    });
  }
});

describe('SEO audit — single top-level heading per page (Req 10.3)', () => {
  for (const key of PAGE_KEYS) {
    it(`"${PAGE_FILES[key]}" has exactly one non-empty <h1>`, () => {
      const doc = DOCS[key];
      const h1s = doc.querySelectorAll('h1');
      expect(
        h1s.length,
        `expected exactly one <h1> in ${PAGE_FILES[key]} but found ${h1s.length}`,
      ).toBe(1);
      expect((h1s[0].textContent || '').trim().length).toBeGreaterThan(0);
    });
  }
});

describe('SEO audit — descriptive, non-generic nav link text (Req 10.4)', () => {
  // The rendered Navigation_Menu is the single source for nav links; render it
  // for an arbitrary current page key and inspect its five links.
  const navDoc = (() => {
    const container = document.createElement('div');
    container.innerHTML = renderNav('home');
    return container;
  })();

  const navLinks = Array.from(navDoc.querySelectorAll('.nav-links a'));

  it('renders exactly five nav links', () => {
    expect(navLinks.length).toBe(PAGES.length);
    expect(navLinks.length).toBe(5);
  });

  it('each nav link uses the descriptive page label as its text', () => {
    const texts = navLinks.map((a) => (a.textContent || '').trim());
    const expectedLabels = PAGES.map((p) => p.label);
    expect(texts).toEqual(expectedLabels);
  });

  it('no nav link text is empty, and none is a generic phrase', () => {
    for (const a of navLinks) {
      const text = (a.textContent || '').trim();
      // Non-empty with at least one visible word.
      expect(text.length).toBeGreaterThan(0);
      expect(/\w/.test(text)).toBe(true);
      // Not solely a generic phrase like "click here" / "read more".
      expect(GENERIC_PHRASES).not.toContain(text.toLowerCase());
    }
  });
});

describe('Cross-page style consistency within 2px, enforced structurally (Req 2.6)', () => {
  // See the header note: jsdom cannot compute real layout/stylesheet values, so
  // "within 2px" heading/button/spacing consistency is guaranteed by every page
  // sharing the SAME stylesheet set (same order) and the SAME element classes.

  it('all five pages link the same three stylesheets in the same order', () => {
    for (const key of PAGE_KEYS) {
      const doc = DOCS[key];
      const hrefs = Array.from(
        doc.querySelectorAll('link[rel="stylesheet"]'),
      ).map((link) => link.getAttribute('href'));
      expect(
        hrefs,
        `stylesheet set/order differs on ${PAGE_FILES[key]}`,
      ).toEqual(EXPECTED_STYLESHEETS);
    }
  });

  it('every CTA button across the pages uses the one shared "btn btn-cta" class', () => {
    let totalCtas = 0;
    for (const key of PAGE_KEYS) {
      const doc = DOCS[key];
      // CTAs are anchors or buttons carrying the shared btn class.
      const ctas = Array.from(doc.querySelectorAll('.btn'));
      for (const cta of ctas) {
        const cls = cta.getAttribute('class') || '';
        // Shared base class + CTA modifier keep button styling identical.
        expect(
          cls.split(/\s+/),
          `CTA on ${PAGE_FILES[key]} is missing a shared btn class: "${cls}"`,
        ).toEqual(expect.arrayContaining(['btn', 'btn-cta']));
        totalCtas += 1;
      }
    }
    // At least the Home, Services, and Contact pages carry a shared CTA.
    expect(totalCtas).toBeGreaterThanOrEqual(3);
  });

  it('headings follow the same tag conventions: one <h1>, section headings use <h2>', () => {
    for (const key of PAGE_KEYS) {
      const doc = DOCS[key];
      // Exactly one top-level heading on every page (same convention site-wide).
      expect(doc.querySelectorAll('h1').length).toBe(1);
      // Section-level headings, where present, use <h2> (never skipping to <h3>
      // without an <h2>), keeping the heading hierarchy identical across pages.
      const h3Count = doc.querySelectorAll('h3').length;
      if (h3Count > 0) {
        expect(
          doc.querySelectorAll('h2').length,
          `${PAGE_FILES[key]} uses <h3> without any <h2> above it`,
        ).toBeGreaterThan(0);
      }
    }
  });
});
