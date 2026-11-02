// tests/degradation.test.js
//
// Shared-component / shared-stylesheet degradation tests (task 15.2, Req 12.5).
//
// Req 12.5: IF a Reusable_Component or shared styling location fails to load on
// a Page, THEN THE Website SHALL still render the Page's primary content AND
// SHALL provide a visible indication that a shared element is unavailable.
//
// There are two distinct failure modes behind Req 12.5, and this suite asserts
// the OBSERVABLE guarantees for each rather than reaching into module
// internals:
//
//   1. JavaScript disabled / shared component script failed to load entirely.
//      Covered by the <noscript> fallback links embedded directly in each
//      landmark: with no JS, mountSharedComponents never runs, and the browser
//      surfaces the five <noscript> nav links so navigation still works. We
//      assert these fallback links exist in the real page HTML on disk, inside
//      both the site-nav and site-footer landmarks, BEFORE any JS mount.
//
//   2. A Reusable_Component throws while rendering (JS ran, but injection
//      failed). The documented contract (js/components.js injectShared) is:
//      the host is filled with a visible renderUnavailableNotice() instead of
//      the error propagating, so the rest of the page — including the primary
//      <main> content — keeps rendering. We assert renderUnavailableNotice
//      produces the visible '.shared-unavailable' notice, and reproduce the
//      documented failure path against a jsdom document to show primary <main>
//      content survives a shared-component injection failure.
//
//   3. Shared STYLESHEET fails to load. A failed CSS load never removes DOM
//      nodes, so the page's primary content and the <noscript> fallback links
//      remain present in the DOM (only visual styling is lost). We assert the
//      primary content and fallback links exist in the parsed page, which is
//      what guarantees "still render the Page's primary content" when
//      components.css is unavailable.
//
// Page HTML is read from disk and parsed into a DOM via jsdom (global in the
// Vitest jsdom environment). Pure/contract exports come from js/components.js.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { renderUnavailableNotice, NOSCRIPT_FALLBACK, PAGES } from '../js/components.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const EXPECTED_HREFS = PAGES.map((p) => p.href); // index/about/services/portfolio/contact

/** Read a page's HTML from disk and parse it into a detached DOM container. */
function parsePage(fileName) {
  const html = readFileSync(join(root, fileName), 'utf8');
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

/** The five real pages all embed the shared landmarks + noscript fallback. */
const PAGE_FILES = ['index.html', 'about.html', 'services.html', 'portfolio.html', 'contact.html'];

/**
 * Faithful reproduction of js/components.js `injectShared` degradation path.
 * injectShared is module-private, so we mirror its documented contract here to
 * exercise the "render threw" branch: on failure the host is filled with the
 * visible unavailable notice instead of the error propagating.
 */
function injectSharedRepro(host, render, label) {
  if (!host) return false;
  try {
    host.innerHTML = render();
    return true;
  } catch {
    host.innerHTML = renderUnavailableNotice(label);
    return false;
  }
}

describe('No-JavaScript / failed-script fallback links (Req 12.5)', () => {
  for (const fileName of PAGE_FILES) {
    describe(fileName, () => {
      const page = parsePage(fileName);
      const navHost = page.querySelector('header[data-component="site-nav"]');
      const footerHost = page.querySelector('footer[data-component="site-footer"]');

      it('has the shared nav and footer landmarks', () => {
        expect(navHost).not.toBeNull();
        expect(footerHost).not.toBeNull();
      });

      it('embeds the five <noscript> fallback nav links inside the nav landmark', () => {
        const noscript = navHost.querySelector('noscript');
        expect(noscript).not.toBeNull();
        // jsdom exposes <noscript> content as inert text; parse it to inspect.
        const frag = document.createElement('div');
        frag.innerHTML = noscript.textContent;
        const links = Array.from(frag.querySelectorAll('.noscript-nav a'));
        expect(links).toHaveLength(5);
        expect(links.map((a) => a.getAttribute('href'))).toEqual(EXPECTED_HREFS);
      });

      it('embeds the five <noscript> fallback nav links inside the footer landmark', () => {
        const noscript = footerHost.querySelector('noscript');
        expect(noscript).not.toBeNull();
        const frag = document.createElement('div');
        frag.innerHTML = noscript.textContent;
        const links = Array.from(frag.querySelectorAll('.noscript-nav a'));
        expect(links).toHaveLength(5);
        expect(links.map((a) => a.getAttribute('href'))).toEqual(EXPECTED_HREFS);
      });
    });
  }

  it('NOSCRIPT_FALLBACK export matches the five-link fallback used by pages', () => {
    const frag = document.createElement('div');
    frag.innerHTML = NOSCRIPT_FALLBACK.replace(/<\/?noscript>/g, '');
    const links = Array.from(frag.querySelectorAll('.noscript-nav a'));
    expect(links).toHaveLength(5);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(EXPECTED_HREFS);
  });
});

describe('Visible "shared element unavailable" indication (Req 12.5)', () => {
  it('renderUnavailableNotice produces a visible .shared-unavailable notice with the label', () => {
    const frag = document.createElement('div');
    frag.innerHTML = renderUnavailableNotice('Navigation');
    const notice = frag.querySelector('.shared-unavailable');
    expect(notice).not.toBeNull();
    // role="status" makes the indication perceivable to assistive tech.
    expect(notice.getAttribute('role')).toBe('status');
    expect(notice.textContent).toContain('Navigation');
    expect(notice.textContent.toLowerCase()).toContain('unavailable');
  });

  it('builds a distinct notice for the Footer element', () => {
    const frag = document.createElement('div');
    frag.innerHTML = renderUnavailableNotice('Footer');
    const notice = frag.querySelector('.shared-unavailable');
    expect(notice).not.toBeNull();
    expect(notice.textContent).toContain('Footer');
  });
});

describe('Primary content survives a shared-component injection failure (Req 12.5)', () => {
  it('keeps <main> primary content and shows the notice when the nav render throws', () => {
    // Build a page with primary content and the two shared landmarks.
    const doc = document.implementation.createHTMLDocument('degradation');
    doc.body.setAttribute('data-page', 'home');
    doc.body.innerHTML =
      '<header data-component="site-nav"></header>' +
      '<main><h1 id="primary">Primary content heading</h1>' +
      '<p class="primary-copy">Primary page content still here.</p></main>' +
      '<footer data-component="site-footer"></footer>';

    const navHost = doc.querySelector('header[data-component="site-nav"]');
    const footerHost = doc.querySelector('footer[data-component="site-footer"]');

    // Simulate the nav Reusable_Component failing to render (Req 12.5 trigger).
    const navOk = injectSharedRepro(
      navHost,
      () => {
        throw new Error('simulated shared-component render failure');
      },
      'Navigation',
    );
    // Footer renders fine in this scenario.
    const footerOk = injectSharedRepro(footerHost, () => '<p>Footer OK</p>', 'Footer');

    expect(navOk).toBe(false);
    expect(footerOk).toBe(true);

    // Primary content is untouched.
    const main = doc.querySelector('main');
    expect(main).not.toBeNull();
    expect(doc.getElementById('primary')).not.toBeNull();
    expect(main.querySelector('.primary-copy').textContent).toContain(
      'Primary page content still here.',
    );

    // Visible "shared element unavailable" indication is in the failed host.
    const notice = navHost.querySelector('.shared-unavailable');
    expect(notice).not.toBeNull();
    expect(notice.textContent).toContain('Navigation');

    // The error did not propagate and did not blank the page body.
    expect(doc.body.contains(main)).toBe(true);
  });
});

describe('Shared stylesheet load failure preserves the DOM (Req 12.5)', () => {
  // A failed <link rel="stylesheet"> never removes DOM nodes; only styling is
  // lost. So the page's primary content and the no-JS fallback links remain.
  for (const fileName of PAGE_FILES) {
    it(`${fileName} still contains primary content and fallback links without its CSS`, () => {
      const page = parsePage(fileName);

      // Primary content landmark is present and non-empty.
      const main = page.querySelector('main');
      expect(main).not.toBeNull();
      expect(main.textContent.trim().length).toBeGreaterThan(0);

      // Exactly one primary heading of primary content.
      const h1s = page.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
      expect(h1s[0].textContent.trim().length).toBeGreaterThan(0);

      // Fallback nav links survive (they live in the landmarks, not the CSS).
      const navNoscript = page.querySelector(
        'header[data-component="site-nav"] noscript',
      );
      const frag = document.createElement('div');
      frag.innerHTML = navNoscript.textContent;
      expect(frag.querySelectorAll('.noscript-nav a')).toHaveLength(5);
    });
  }
});
