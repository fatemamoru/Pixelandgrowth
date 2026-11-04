// tests/contrast.property.test.js
//
// Property 13: Brand color pairings meet contrast thresholds
// Tag: Feature: pixel-growth-website, Property 13: Brand color pairings meet contrast thresholds
//
// For all declared (text color, background color) role pairings used on the
// site, the computed WCAG contrast ratio is at least 4.5:1 for normal body
// text and at least 3:1 for large text.
//
// Validates: Requirements 9.4
//
// The brand palette is declared in css/tokens.css as the single source of
// truth. These values are mirrored here (the test must NOT alter the palette;
// if a pairing fails its threshold the test fails and reports the gap).

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// --- Brand palette (mirrors css/tokens.css) ---
const PALETTE = {
  navy: '#0B1F3A',
  navySoft: '#14305A',
  gold: '#C9A24B',
  goldDeep: '#7A5F1E',
  white: '#FFFFFF',
  ivory: '#FAF7F0',
  sand: '#F1ECE0',
  slate: '#4B5A70',
  error: '#9B1C1C',
};

// --- Declared on-brand role pairings used on the site ---
// body: normal body text, requires >= 4.5:1
// large: large text / buttons, requires >= 3:1
const PAIRINGS = [
  // Body copy and headings on light surfaces
  { name: 'navy text on white bg', text: PALETTE.navy, bg: PALETTE.white, kind: 'body', threshold: 4.5 },
  { name: 'navy text on ivory bg', text: PALETTE.navy, bg: PALETTE.ivory, kind: 'body', threshold: 4.5 },
  { name: 'navy text on sand bg', text: PALETTE.navy, bg: PALETTE.sand, kind: 'body', threshold: 4.5 },
  { name: 'slate muted text on white bg', text: PALETTE.slate, bg: PALETTE.white, kind: 'body', threshold: 4.5 },
  { name: 'slate muted text on ivory bg', text: PALETTE.slate, bg: PALETTE.ivory, kind: 'body', threshold: 4.5 },
  { name: 'deep gold accent text on white bg', text: PALETTE.goldDeep, bg: PALETTE.white, kind: 'body', threshold: 4.5 },
  { name: 'deep gold accent text on ivory bg', text: PALETTE.goldDeep, bg: PALETTE.ivory, kind: 'body', threshold: 4.5 },
  { name: 'form error text on white bg', text: PALETTE.error, bg: PALETTE.white, kind: 'body', threshold: 4.5 },
  // Text on dark surfaces
  { name: 'white text on navy bg', text: PALETTE.white, bg: PALETTE.navy, kind: 'body', threshold: 4.5 },
  { name: 'white text on navy-soft bg', text: PALETTE.white, bg: PALETTE.navySoft, kind: 'body', threshold: 4.5 },
  { name: 'gold accent text on navy bg', text: PALETTE.gold, bg: PALETTE.navy, kind: 'body', threshold: 4.5 },
  { name: 'gold accent text on navy-soft bg', text: PALETTE.gold, bg: PALETTE.navySoft, kind: 'body', threshold: 4.5 },
  // Gold buttons and the gold call-to-action band
  { name: 'navy text on gold bg (buttons, CTA band)', text: PALETTE.navy, bg: PALETTE.gold, kind: 'body', threshold: 4.5 },
];

// --- WCAG relative-luminance contrast-ratio calculator ---
// https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio

/** Parse a #RRGGBB hex string into {r,g,b} integers (0-255). */
function parseHex(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Linearize a single 0-255 channel per the WCAG sRGB definition. */
function linearizeChannel(c8) {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance of a #RRGGBB color. */
function relativeLuminance(hex) {
  const { r, g, b } = parseHex(hex);
  return (
    0.2126 * linearizeChannel(r) +
    0.7152 * linearizeChannel(g) +
    0.0722 * linearizeChannel(b)
  );
}

/** WCAG contrast ratio between two #RRGGBB colors (1..21). */
function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Feature: pixel-growth-website, Property 13: Brand color pairings meet contrast thresholds', () => {
  it('every declared text/background pairing meets its WCAG contrast threshold (body >=4.5:1, large >=3:1)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...PAIRINGS), (pairing) => {
        const ratio = contrastRatio(pairing.text, pairing.bg);
        // Contrast is symmetric, so order of text/bg does not matter.
        expect(
          ratio,
          `${pairing.name} (${pairing.kind} text) has contrast ${ratio.toFixed(2)}:1, ` +
            `below the required ${pairing.threshold}:1`,
        ).toBeGreaterThanOrEqual(pairing.threshold);
      }),
      { numRuns: 100 },
    );
  });
});
