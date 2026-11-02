// tests/pages.test.js
//
// Example tests for page-specific guarantees (task 10.7). These assert concrete
// behaviours of the assembled pages rather than universal properties:
//
//   - Home (index.html): the Hero shows the tagline "Build. Connect. Grow."
//     and offers a call-to-action that links to the Contact page
//     (Req 3.1, 2.5).
//   - Portfolio empty state: renderPortfolioList([]) (and a list of all-invalid
//     projects) renders the "coming soon" message, proving the no-projects
//     state (Req 6.6).
//   - Contact (contact.html): the page contains NO fabricated business address
//     and NO phone number — no tel input, no tel: link, no phone/address field,
//     and no address/phone text (Req 7.7).
//
// Page HTML is read from disk with node:fs and parsed into a DOM via jsdom
// (available globally through the Vitest jsdom environment). The pure
// renderPortfolioList helper is imported directly from js/render.js.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { renderPortfolioList, PORTFOLIO_EMPTY_MESSAGE } from '../js/render.js';

const TAGLINE = 'Build. Connect. Grow.';

// Resolve page paths relative to this test file so the suite runs from any CWD.
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

/** Read a page's HTML from disk and parse it into a detached DOM document. */
function parsePage(fileName) {
  const html = readFileSync(join(root, fileName), 'utf8');
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

describe('Home hero (Req 3.1, 2.5)', () => {
  const home = parsePage('index.html');

  it('displays the tagline "Build. Connect. Grow."', () => {
    // textContent decodes entities, so the literal human-readable tagline shows.
    expect(home.textContent).toContain(TAGLINE);
  });

  it('offers a call-to-action linking to the Contact page', () => {
    const contactLinks = Array.from(home.querySelectorAll('a')).filter(
      (a) => a.getAttribute('href') === 'contact.html',
    );
    // At least one <a href="contact.html"> exists as the hero/contact CTA.
    expect(contactLinks.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Portfolio no-projects state (Req 6.6)', () => {
  it('renders the coming-soon message for an empty list', () => {
    const html = renderPortfolioList([]);
    expect(html).toContain(PORTFOLIO_EMPTY_MESSAGE);
  });

  it('renders the coming-soon message when every project is invalid', () => {
    const allInvalid = [
      { id: 'a', description: 'missing title' },
      { id: 'b', title: 'missing description' },
      { id: 'c', title: '   ', description: '   ' },
      null,
      undefined,
      {},
    ];
    const html = renderPortfolioList(allInvalid);
    expect(html).toContain(PORTFOLIO_EMPTY_MESSAGE);
    // No portfolio cards should have been produced.
    expect(html).not.toContain('portfolio-card');
  });
});

describe('Contact page omits address and phone (Req 7.7)', () => {
  const contact = parsePage('contact.html');

  it('has no telephone input control', () => {
    expect(contact.querySelector('input[type="tel"]')).toBeNull();
  });

  it('has no tel: links', () => {
    expect(contact.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it('has no form field whose name or id references phone or address', () => {
    const controls = Array.from(contact.querySelectorAll('input, textarea, select'));
    for (const control of controls) {
      const name = (control.getAttribute('name') || '').toLowerCase();
      const id = (control.getAttribute('id') || '').toLowerCase();
      expect(name).not.toContain('phone');
      expect(name).not.toContain('address');
      expect(id).not.toContain('phone');
      expect(id).not.toContain('address');
    }
  });

  it('has no visible label or text mentioning phone or address', () => {
    const text = contact.textContent.toLowerCase();
    expect(text).not.toContain('phone');
    expect(text).not.toContain('address');
  });

  it('contains no phone-number-shaped text', () => {
    // Common phone formats: (123) 456-7890, 123-456-7890, 123.456.7890,
    // +1 234 567 8901, and 10+ consecutive digit runs.
    const text = contact.textContent;
    const phonePattern =
      /(\+?\d[\d\s().-]{7,}\d)|(\(\d{3}\)\s*\d{3}[-.\s]?\d{4})/;
    expect(phonePattern.test(text)).toBe(false);
  });
});
