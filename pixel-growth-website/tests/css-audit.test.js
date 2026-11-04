// tests/css-audit.test.js
//
// Static-analysis audit of the stylesheets (task 15.1). These tests read the
// CSS files from disk with node:fs and assert the brand/stack constraints the
// design mandates:
//
//   - Hex-only-in-tokens (Req 2.1, 12.4): raw hex color literals may appear
//     ONLY in tokens.css. base.css and components.css must reference the brand
//     palette exclusively through var(--...) custom properties.
//   - Brand palette present (Req 2.1): tokens.css declares the four brand hex
//     values — navy #0B1F3A, gold #C9A24B, white #FFFFFF, ivory #FAF7F0.
//   - Font-display swap (Req 2.3): every @font-face block in tokens.css uses
//     font-display: swap so text is never blocked on the primary font.
//   - Font stack order (Req 2.2): --font-primary lists Playfair Display before Inter.
//
// No DOM is needed — this is pure text analysis of the source files.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Resolve CSS paths relative to this test file so the suite runs from any CWD.
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

/** Read a stylesheet from css/ as UTF-8 text. */
function readCss(fileName) {
  return readFileSync(join(root, 'css', fileName), 'utf8');
}

// Matches CSS hex color literals: # followed by 3, 4, 6, or 8 hex digits.
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

// The four brand palette colors that must live in tokens.css (Req 2.1).
const BRAND_HEX = ['#0B1F3A', '#C9A24B', '#FFFFFF', '#FAF7F0'];

describe('CSS audit — hex colors only in tokens.css (Req 2.1, 12.4)', () => {
  it('base.css contains no raw hex color literals', () => {
    const css = readCss('base.css');
    const matches = css.match(HEX_RE) ?? [];
    expect(matches).toEqual([]);
  });

  it('components.css contains no raw hex color literals', () => {
    const css = readCss('components.css');
    const matches = css.match(HEX_RE) ?? [];
    expect(matches).toEqual([]);
  });

  it('tokens.css declares all four brand hex values', () => {
    const css = readCss('tokens.css').toUpperCase();
    for (const hex of BRAND_HEX) {
      expect(css).toContain(hex.toUpperCase());
    }
  });
});

describe('CSS audit — non-token stylesheets reference variables (Req 12.4)', () => {
  // Spot check: every `background`/`color` color usage in the component and
  // base stylesheets routes through a custom property, never a literal. Since
  // the hex-literal tests above already prove no hex escapes tokens.css, here
  // we confirm the files actually DO use var(--...) for their coloring (i.e.
  // they are not simply colorless).
  it('base.css uses var(--...) for coloring', () => {
    const css = readCss('base.css');
    expect(css).toMatch(/var\(--color-/);
  });

  it('components.css uses var(--...) for coloring', () => {
    const css = readCss('components.css');
    expect(css).toMatch(/var\(--color-/);
  });
});

describe('CSS audit — @font-face uses font-display: swap (Req 2.3)', () => {
  it('every @font-face block declares font-display: swap', () => {
    const css = readCss('tokens.css');
    const fontFaceCount = (css.match(/@font-face/g) ?? []).length;
    const swapCount = (css.match(/font-display:\s*swap/g) ?? []).length;

    // There must be at least one @font-face, and each one must carry a swap.
    expect(fontFaceCount).toBeGreaterThan(0);
    expect(swapCount).toBeGreaterThanOrEqual(fontFaceCount);
  });
});

describe('CSS audit — font stack order (Req 2.2)', () => {
  it('--font-primary lists Playfair Display before Inter', () => {
    const css = readCss('tokens.css');

    // Extract the --font-primary declaration value.
    const match = css.match(/--font-primary\s*:\s*([^;]+);/);
    expect(match).not.toBeNull();

    const value = match[1];
    const primaryIdx = value.indexOf('Playfair Display');
    const interIdx = value.indexOf('Inter');

    expect(primaryIdx).toBeGreaterThanOrEqual(0);
    expect(interIdx).toBeGreaterThanOrEqual(0);
    expect(primaryIdx).toBeLessThan(interIdx);
  });
});
