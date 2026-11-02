// tests/h1.property.test.js
//
// Property 10: Each page has exactly one non-empty top-level heading
// Tag: Feature: pixel-growth-website, Property 10: Each page has exactly one non-empty top-level heading
//
// For each of the five pages (index, about, services, portfolio, contact),
// the rendered HTML must contain exactly one <h1> element whose trimmed text
// content is non-empty. A single, meaningful top-level heading per page is a
// core SEO/accessibility guarantee.
//
// Validates: Requirements 10.3
//
// The five HTML files are the single source of truth; this test reads them
// from disk (no build step) and parses them into a DOM. If a page is missing
// an <h1>, has more than one, or the <h1> text is empty/whitespace, the test
// fails and reports the offending page.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The five page files live at the project root (one level up from tests/).
const PROJECT_ROOT = join(__dirname, '..');

// The five page file names (the full navigable page set).
const PAGE_FILES = [
  'index.html',
  'about.html',
  'services.html',
  'portfolio.html',
  'contact.html',
];

// Read and parse each page once up front; parsing is pure and the files do
// not change across iterations, so this keeps the property run fast.
const PARSED_PAGES = Object.fromEntries(
  PAGE_FILES.map((file) => {
    const html = readFileSync(join(PROJECT_ROOT, file), 'utf-8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return [file, doc];
  }),
);

describe('Feature: pixel-growth-website, Property 10: Each page has exactly one non-empty top-level heading', () => {
  it('every one of the five pages has exactly one <h1> with non-empty text', () => {
    fc.assert(
      fc.property(fc.constantFrom(...PAGE_FILES), (file) => {
        const doc = PARSED_PAGES[file];
        const headings = doc.querySelectorAll('h1');

        // Exactly one <h1>.
        expect(
          headings.length,
          `expected exactly one <h1> in "${file}" but found ${headings.length}`,
        ).toBe(1);

        // Its text content must be non-empty after trimming.
        const text = (headings[0].textContent || '').trim();
        expect(
          text.length,
          `the <h1> in "${file}" has empty or whitespace-only text`,
        ).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});
