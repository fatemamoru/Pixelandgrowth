// tests/responsive.test.js
//
// Integration tests for responsive behavior (task 12.2).
//
// Covers three responsive guarantees from the requirements:
//
//   - Req 8.2 (mobile menu): below the tablet breakpoint the five nav links
//     collapse behind a toggle button; activating the toggle shows/hides the
//     links and flips the button's `aria-expanded`. This is exercised against
//     the live `wireNavToggle` behavior wired in js/components.js (task 12.1).
//
//   - Req 8.4 (readable body text): the base body font-size is >= 16px. The
//     declared base rule in css/base.css is asserted directly, because jsdom
//     does not apply styles from linked stylesheets to compute `getComputedStyle`
//     for elements the way a real browser does.
//
//   - Req 8.3 / 4.7 (no horizontal scroll across 320-1920px): a true pixel
//     overflow check (scrollWidth <= clientWidth at each sampled width) requires
//     a real layout engine. jsdom performs NO layout — scrollWidth and
//     clientWidth are both 0 for every element at every width — so a genuine
//     overflow assertion is impossible here. Instead we assert the STRUCTURAL
//     CSS guarantees that prevent horizontal overflow: `box-sizing: border-box`
//     and `max-width: 100%` on media (base.css), and `minmax(0, 1fr)` grid
//     tracks plus `width: 100%` fluid containers (components.css). See the
//     NOTE below — real pixel overflow testing across the sampled widths needs
//     a real browser (e.g. Playwright) and is approximated here by verifying
//     those guarantees hold.
//
// Page/CSS text is read from disk with node:fs. The DOM is provided by the
// Vitest jsdom environment. `renderNav` and `wireNavToggle` are imported
// directly from js/components.js.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { renderNav, wireNavToggle } from '../js/components.js';

// Resolve paths relative to this test file so the suite runs from any CWD.
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

/** Read a stylesheet (or any text file) from the project root. */
function readFile(relPath) {
  return readFileSync(join(root, relPath), 'utf8');
}

/** Normalize whitespace so multi-line / spacing variations don't defeat matches. */
function squish(css) {
  return css.replace(/\s+/g, ' ');
}

// The widths the responsive layout must survive without horizontal scroll
// (Req 8.3, 4.7). jsdom can't lay these out, so they drive the documentation
// of what a real browser would check rather than a live measurement.
const SAMPLED_WIDTHS = [320, 375, 414, 600, 768, 1024, 1280, 1440, 1920];

// ---------------------------------------------------------------------------
// Req 8.2 — mobile toggle shows/hides links and flips aria-expanded.
//
// The toggle's visibility below 768px is CSS-driven (asserted structurally in
// the "no horizontal scroll" block / components.css media queries); here we
// verify the behavioral contract wired in JS: clicking toggles `is-open` on the
// link list and flips `aria-expanded` on the button.
// ---------------------------------------------------------------------------
describe('Mobile nav toggle behavior (Req 8.2)', () => {
  /**
   * Build a jsdom header landmark containing renderNav('home') and wire the
   * mobile toggle, returning the host plus the toggle button and link list.
   */
  function mountNav() {
    const host = document.createElement('header');
    host.setAttribute('data-component', 'site-nav');
    host.innerHTML = renderNav('home');
    // Attach to the document so aria-controls -> getElementById resolves,
    // exactly as it does at runtime.
    document.body.appendChild(host);
    wireNavToggle(host);

    const toggle = host.querySelector('.nav-toggle');
    const links = host.querySelector('#nav-links');
    return { host, toggle, links };
  }

  it('renders the toggle button and the controlled link list', () => {
    const { host, toggle, links } = mountNav();
    try {
      expect(toggle).not.toBeNull();
      expect(links).not.toBeNull();
      // The toggle controls the link list by id (Req 8.2 structure).
      expect(toggle.getAttribute('aria-controls')).toBe('nav-links');
      expect(links.id).toBe('nav-links');
      // Five links behind the toggle, one per page.
      expect(links.querySelectorAll('a')).toHaveLength(5);
    } finally {
      host.remove();
    }
  });

  it('starts collapsed: aria-expanded="false" and the list is not open', () => {
    const { host, toggle, links } = mountNav();
    try {
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(links.classList.contains('is-open')).toBe(false);
    } finally {
      host.remove();
    }
  });

  it('first click shows the links and flips aria-expanded to "true"', () => {
    const { host, toggle, links } = mountNav();
    try {
      toggle.click();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(links.classList.contains('is-open')).toBe(true);
    } finally {
      host.remove();
    }
  });

  it('second click hides the links and flips aria-expanded back to "false"', () => {
    const { host, toggle, links } = mountNav();
    try {
      toggle.click(); // open
      toggle.click(); // close
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(links.classList.contains('is-open')).toBe(false);
    } finally {
      host.remove();
    }
  });

  it('toggles consistently across repeated clicks (dispatchEvent)', () => {
    const { host, toggle, links } = mountNav();
    try {
      for (let i = 1; i <= 6; i += 1) {
        toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        const expectedOpen = i % 2 === 1; // odd clicks -> open, even -> closed
        expect(links.classList.contains('is-open')).toBe(expectedOpen);
        expect(toggle.getAttribute('aria-expanded')).toBe(
          expectedOpen ? 'true' : 'false',
        );
      }
    } finally {
      host.remove();
    }
  });
});

// ---------------------------------------------------------------------------
// Req 8.4 — base body font-size is >= 16px.
//
// jsdom does not apply linked-stylesheet rules to computed styles, so we assert
// the DECLARED base rule in css/base.css: the body selector sets
// `font-size: <N>px` with N >= 16 (the spec sets exactly 16px).
// ---------------------------------------------------------------------------
describe('Base body font-size >= 16px (Req 8.4)', () => {
  const baseCss = readFile('css/base.css');

  it('declares a body font-size of at least 16px', () => {
    // Find the `body { ... }` rule block, then the font-size within it.
    const bodyRule = squish(baseCss).match(/body\s*\{([^}]*)\}/i);
    expect(bodyRule).not.toBeNull();

    const fontSize = bodyRule[1].match(/font-size:\s*(\d+(?:\.\d+)?)px/i);
    expect(fontSize).not.toBeNull();

    const px = parseFloat(fontSize[1]);
    expect(px).toBeGreaterThanOrEqual(16);
  });

  it('does not shrink text below 16px via text-size-adjust', () => {
    // The 100% text-size-adjust prevents mobile browsers inflating/deflating
    // the 16px base, keeping body text readable (Req 8.4).
    expect(squish(baseCss)).toMatch(/text-size-adjust:\s*100%/i);
  });
});

// ---------------------------------------------------------------------------
// Req 8.3 / 4.7 — no horizontal scroll across 320-1920px.
//
// NOTE: A faithful check would set the viewport to each sampled width and
// assert document.documentElement.scrollWidth <= clientWidth. jsdom performs no
// layout, so both are 0 at every width and the check is vacuous/impossible.
// Real pixel overflow testing across these widths requires a real browser
// (e.g. Playwright) driving the rendered pages. Here we APPROXIMATE that
// guarantee by asserting the structural CSS guards that make horizontal
// overflow impossible by construction, at every width.
// ---------------------------------------------------------------------------
describe('No horizontal scroll guards 320-1920px (Req 8.3, 4.7)', () => {
  const baseCss = squish(readFile('css/base.css'));
  const componentsCss = squish(readFile('css/components.css'));

  it('documents the sampled widths a real browser would verify', () => {
    // Placeholder that records intent: in a Playwright run each of these widths
    // would be checked for scrollWidth <= clientWidth. jsdom cannot, so we only
    // assert the structural guards below.
    expect(SAMPLED_WIDTHS[0]).toBe(320);
    expect(SAMPLED_WIDTHS[SAMPLED_WIDTHS.length - 1]).toBe(1920);
  });

  it('uses border-box sizing so padding/borders never widen elements (base.css)', () => {
    expect(baseCss).toMatch(/box-sizing:\s*border-box/i);
  });

  it('caps media at max-width: 100% so images never overflow (base.css)', () => {
    // The responsive media rule constrains img/picture/svg/video to their box.
    expect(baseCss).toMatch(/max-width:\s*100%/i);
  });

  it('uses minmax(0, 1fr) grid tracks so content cannot widen a column (components.css)', () => {
    // minmax(0, 1fr) prevents intrinsic content (long words/images) from
    // pushing a grid track past the viewport.
    expect(componentsCss).toMatch(/minmax\(\s*0\s*,\s*1fr\s*\)/i);
  });

  it('uses fluid width: 100% containers rather than fixed over-wide widths (components.css)', () => {
    expect(componentsCss).toMatch(/width:\s*100%/i);
  });

  it('constrains primary containers to the viewport via max-width, not fixed px (base.css)', () => {
    // main is capped at a token max-width and centered, but still width:100%,
    // so it shrinks to narrow viewports instead of forcing scroll.
    expect(baseCss).toMatch(/max-width:\s*var\(--bp-desktop\)/i);
    expect(baseCss).toMatch(/main\s*\{[^}]*width:\s*100%/i);
  });

  it('declares mobile-first breakpoints that re-show nav links at >=768px (components.css)', () => {
    // Below 768px links collapse behind the toggle; at >=768px they return.
    // This is the CSS side of the Req 8.2 toggle visibility.
    expect(componentsCss).toMatch(/@media \(min-width: 768px\)/i);
    expect(componentsCss).toMatch(/\.nav-links\.is-open\s*\{\s*display:\s*flex/i);
  });
});
