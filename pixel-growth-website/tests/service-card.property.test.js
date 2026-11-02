// tests/service-card.property.test.js
//
// Property 5: Service cards contain their content
// Tag: Feature: pixel-growth-website, Property 5: Service cards contain their content
//
// For any valid Service record (title 1-60 chars, description 1-500 chars, both
// non-empty and not whitespace-only), renderServiceCard(service) returns markup
// that is non-null and contains both the title and description text. Because the
// renderer HTML-escapes text content, the assertion compares against the escaped
// form of each field.
//
// Validates: Requirements 3.3, 5.2

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { renderServiceCard, escapeHtml } from '../js/render.js';

// A safe character set for generating title/description text. We draw from
// letters, digits, spaces, and common punctuation. HTML-special characters are
// handled separately by escaping: the assertion uses escapeHtml() on the
// expected substrings, so any generated content is matched correctly.
const SAFE_CHARS = [
  ...'abcdefghijklmnopqrstuvwxyz',
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ...'0123456789',
  ...' .,!?-:&<>"\'',
];

// fast-check v4: do NOT use fc.stringOf. Build a bounded string from an array of
// characters drawn from the safe set, then join.
function boundedString(minLength, maxLength) {
  return fc
    .array(fc.constantFrom(...SAFE_CHARS), { minLength, maxLength })
    .map((chars) => chars.join(''));
}

// A generated field is only a valid Service field if it is non-empty after
// trimming (the renderer rejects whitespace-only input with null). We filter the
// generated strings so the generator always produces renderable input.
const title = boundedString(1, 60).filter((s) => s.trim().length > 0);
const description = boundedString(1, 500).filter((s) => s.trim().length > 0);

const validService = fc.record({
  id: fc.string(),
  title,
  description,
});

describe('Feature: pixel-growth-website, Property 5: Service cards contain their content', () => {
  it('renders non-null markup containing the title and description', () => {
    fc.assert(
      fc.property(validService, (service) => {
        const html = renderServiceCard(service);

        expect(html, 'expected valid service to render non-null markup').not.toBeNull();
        expect(html).toContain(escapeHtml(service.title));
        expect(html).toContain(escapeHtml(service.description));
      }),
      { numRuns: 100 },
    );
  });
});
