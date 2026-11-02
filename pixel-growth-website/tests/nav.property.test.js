// tests/nav.property.test.js
//
// Property 1: Navigation renders exactly five links with one correct active indicator
// Tag: Feature: pixel-growth-website, Property 1: Navigation renders exactly five links with one correct active indicator
//
// For every page key in {home, about, services, portfolio, contact},
// renderNav(key) produces exactly five navigation links (inside the
// #nav-links list) whose hrefs are the five page files, with exactly one link
// marked active (class contains "is-active" AND aria-current="page"), and that
// active link's href matches the given key's href.
//
// The generator draws the page key via fc.constantFrom over the PAGES keys,
// which covers all five keys exhaustively across the >= 100 iterations (and
// samples them randomly). renderNav returns an HTML string, which we parse into
// a DOM to make structural assertions. Assertions are scoped to the #nav-links
// list so the logo anchor (which also points at index.html) is not counted.
//
// Validates: Requirements 1.3, 1.6

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { renderNav, PAGES } from '../js/components.js';

// The five page files, in page order, as a plain lookup for assertions.
const EXPECTED_HREFS = PAGES.map((p) => p.href);
const PAGE_KEYS = PAGES.map((p) => p.key);
const HREF_BY_KEY = Object.fromEntries(PAGES.map((p) => [p.key, p.href]));

// Parse the nav HTML string into a detached DOM node we can query.
function parseNav(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

describe('Feature: pixel-growth-website, Property 1: Navigation renders exactly five links with one correct active indicator', () => {
  it('renders exactly five page links with one correct active indicator for every page key', () => {
    fc.assert(
      fc.property(fc.constantFrom(...PAGE_KEYS), (key) => {
        const dom = parseNav(renderNav(key));

        // The links live inside the #nav-links list; scoping here excludes the
        // logo anchor (which also targets index.html).
        const navList = dom.querySelector('#nav-links');
        expect(navList, 'expected a #nav-links list in the rendered nav').not.toBeNull();

        const links = Array.from(navList.querySelectorAll('a'));

        // Exactly five links.
        expect(links).toHaveLength(5);

        // The five hrefs are exactly the five page files, in page order.
        const hrefs = links.map((a) => a.getAttribute('href'));
        expect(hrefs).toEqual(EXPECTED_HREFS);
        expect([...hrefs].sort()).toEqual([...EXPECTED_HREFS].sort());

        // Exactly one active link: class contains "is-active" AND
        // aria-current="page".
        const activeLinks = links.filter(
          (a) =>
            a.classList.contains('is-active') &&
            a.getAttribute('aria-current') === 'page',
        );
        expect(activeLinks).toHaveLength(1);

        // No other link carries either active marker.
        const nonActive = links.filter((a) => a !== activeLinks[0]);
        for (const a of nonActive) {
          expect(a.classList.contains('is-active')).toBe(false);
          expect(a.getAttribute('aria-current')).toBeNull();
        }

        // The single active link targets the page matching the given key.
        expect(activeLinks[0].getAttribute('href')).toBe(HREF_BY_KEY[key]);
      }),
      { numRuns: 100 },
    );
  });
});
