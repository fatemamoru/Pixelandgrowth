// tests/seo-description.property.test.js
//
// Property 9: Page meta descriptions are length-bounded
// Tag: Feature: pixel-growth-website, Property 9: Page meta descriptions are length-bounded
//
// For all five page keys, the corresponding <meta name="description"> content
// is a non-empty string between DESCRIPTION_MIN (50) and DESCRIPTION_MAX (160)
// characters inclusive.
//
// Validates: Requirements 10.2
//
// PAGE_METADATA in js/seo.js is the single source of truth for per-page SEO
// metadata; this test must not alter it. If a description is empty or out of
// range, the test fails and reports the offending page.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  PAGE_METADATA,
  PAGE_KEYS,
  DESCRIPTION_MIN,
  DESCRIPTION_MAX,
} from '../js/seo.js';

describe('Feature: pixel-growth-website, Property 9: Page meta descriptions are length-bounded', () => {
  it(`each of the five page descriptions is a non-empty string ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} chars`, () => {
    fc.assert(
      fc.property(fc.constantFrom(...PAGE_KEYS), (key) => {
        const { description } = PAGE_METADATA[key];

        // Non-empty string check.
        expect(
          typeof description,
          `description for page "${key}" must be a string but was ${typeof description}`,
        ).toBe('string');
        expect(
          description.trim().length,
          `description for page "${key}" must be non-empty`,
        ).toBeGreaterThan(0);

        // Length bound (inclusive).
        const length = description.length;
        expect(
          length,
          `description for page "${key}" is ${length} chars, outside [${DESCRIPTION_MIN}, ${DESCRIPTION_MAX}]: "${description}"`,
        ).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
        expect(
          length,
          `description for page "${key}" is ${length} chars, outside [${DESCRIPTION_MIN}, ${DESCRIPTION_MAX}]: "${description}"`,
        ).toBeLessThanOrEqual(DESCRIPTION_MAX);
      }),
      { numRuns: 100 },
    );
  });
});
