// tests/footer.test.js
//
// Example tests for the shared Footer content (Req 1.8).
//
// Req 1.8: THE Footer SHALL contain the business name "Pixel & Growth", the
// tagline "Build. Connect. Grow.", and links to the five Pages.
//
// renderFooter() is a pure function returning an HTML string. We parse that
// string into a DOM so we can assert on rendered text content (where the
// escaped "&amp;" in the markup string becomes "&" again) and on the five
// page links.
//
// These are example (unit) tests, not property-based tests.

import { describe, it, expect } from 'vitest';
import { renderFooter, PAGES } from '../js/components.js';

const BUSINESS_NAME = 'Pixel & Growth';
const TAGLINE = 'Build. Connect. Grow.';
const EXPECTED_HREFS = PAGES.map((p) => p.href); // index/about/services/portfolio/contact

// Parse the footer HTML string into a detached DOM node we can query.
function parseFooter(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

describe('renderFooter content (Req 1.8)', () => {
  it('contains the business name "Pixel & Growth"', () => {
    const dom = parseFooter(renderFooter());
    // textContent decodes "&amp;" back to "&", so match the human-readable name.
    expect(dom.textContent).toContain(BUSINESS_NAME);
  });

  it('contains the tagline "Build. Connect. Grow."', () => {
    const dom = parseFooter(renderFooter());
    expect(dom.textContent).toContain(TAGLINE);
  });

  it('contains exactly five page links to the five Pages', () => {
    const dom = parseFooter(renderFooter());
    const links = Array.from(dom.querySelectorAll('a'));

    // Exactly five links.
    expect(links).toHaveLength(5);

    // The five hrefs are exactly the five page files, in page order.
    const hrefs = links.map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(EXPECTED_HREFS);
    expect([...hrefs].sort()).toEqual(
      ['about.html', 'contact.html', 'index.html', 'portfolio.html', 'services.html'],
    );
  });
});
