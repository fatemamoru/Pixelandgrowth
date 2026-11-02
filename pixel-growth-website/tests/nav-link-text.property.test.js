// tests/nav-link-text.property.test.js
//
// Property 11: Navigation link text is descriptive and non-generic
// Tag: Feature: pixel-growth-website, Property 11: Navigation link text is descriptive and non-generic
//
// For every page key in {home, about, services, portfolio, contact},
// renderNav(key) produces five navigation links (inside the #nav-links list)
// whose text is descriptive rather than a generic, meaningless call-to-action.
// For each of the five anchors we assert that its text content is:
//   - non-empty after trimming,
//   - contains at least one visible word character (matches /\w/), and
//   - is not solely a generic phrase ("click here" / "read more"),
//     compared case-insensitively on the trimmed text.
//
// The generator draws the page key via fc.constantFrom over the PAGES keys,
// which covers all five keys exhaustively across the >= 100 iterations (and
// samples them randomly). The active state does not change link text, so this
// holds for every key. renderNav returns an HTML string, which we parse into a
// DOM so textContent reflects the rendered (entity-decoded) text. Assertions
// are scoped to the #nav-links list so the logo anchor is not counted.
//
// Validates: Requirements 10.4

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { renderNav, PAGES } from '../js/components.js';

const PAGE_KEYS = PAGES.map((p) => p.key);

// Generic, non-descriptive link phrases that must never be the entire text of a
// navigation link (compared case-insensitively on the trimmed text).
const GENERIC_PHRASES = new Set(['click here', 'read more']);

// Parse the nav HTML string into a detached DOM node we can query.
function parseNav(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

describe('Feature: pixel-growth-website, Property 11: Navigation link text is descriptive and non-generic', () => {
  it('every nav link has non-empty, word-bearing, non-generic text for every page key', () => {
    fc.assert(
      fc.property(fc.constantFrom(...PAGE_KEYS), (key) => {
        const dom = parseNav(renderNav(key));

        // Scope to the #nav-links list so the logo anchor is excluded.
        const navList = dom.querySelector('#nav-links');
        expect(navList, 'expected a #nav-links list in the rendered nav').not.toBeNull();

        const links = Array.from(navList.querySelectorAll('a'));

        // Exactly the five page links.
        expect(links).toHaveLength(5);

        for (const anchor of links) {
          const text = (anchor.textContent || '').trim();

          // Non-empty after trim.
          expect(text.length).toBeGreaterThan(0);

          // At least one visible word character.
          expect(text).toMatch(/\w/);

          // Not solely a generic call-to-action phrase.
          expect(GENERIC_PHRASES.has(text.toLowerCase())).toBe(false);
        }
      }),
      { numRuns: 100 },
    );
  });
});
