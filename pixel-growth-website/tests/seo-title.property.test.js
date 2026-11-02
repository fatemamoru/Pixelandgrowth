// tests/seo-title.property.test.js
//
// Property 8: Page titles are unique and length-bounded
// Tag: Feature: pixel-growth-website, Property 8: Page titles are unique and length-bounded
//
// For all five page keys, the corresponding <title> is between TITLE_MIN (10)
// and TITLE_MAX (60) characters inclusive, and no two of the five titles are
// identical.
//
// Validates: Requirements 10.1
//
// PAGE_METADATA in js/seo.js is the single source of truth for per-page SEO
// metadata; this test must not alter it. If a title is out of range or two
// titles collide, the test fails and reports the offending page.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  PAGE_METADATA,
  PAGE_KEYS,
  TITLE_MIN,
  TITLE_MAX,
} from '../js/seo.js';

describe('Feature: pixel-growth-website, Property 8: Page titles are unique and length-bounded', () => {
  it(`each of the five page titles is ${TITLE_MIN}-${TITLE_MAX} chars and all five are unique`, () => {
    // Uniqueness across the whole set is a single global check (the set of all
    // five titles must have exactly five distinct values). Verified alongside
    // the per-key length bound so the property holds for every sampled key.
    const allTitles = PAGE_KEYS.map((key) => PAGE_METADATA[key].title);
    const uniqueTitles = new Set(allTitles);

    fc.assert(
      fc.property(fc.constantFrom(...PAGE_KEYS), (key) => {
        const { title } = PAGE_METADATA[key];

        // Length bound (inclusive).
        const length = title.length;
        expect(
          length,
          `title for page "${key}" is ${length} chars, outside [${TITLE_MIN}, ${TITLE_MAX}]: "${title}"`,
        ).toBeGreaterThanOrEqual(TITLE_MIN);
        expect(
          length,
          `title for page "${key}" is ${length} chars, outside [${TITLE_MIN}, ${TITLE_MAX}]: "${title}"`,
        ).toBeLessThanOrEqual(TITLE_MAX);

        // Uniqueness: the set of all five titles has five distinct values.
        expect(
          uniqueTitles.size,
          `expected 5 unique titles but found ${uniqueTitles.size}; titles: ${JSON.stringify(allTitles)}`,
        ).toBe(PAGE_KEYS.length);
      }),
      { numRuns: 100 },
    );
  });
});
