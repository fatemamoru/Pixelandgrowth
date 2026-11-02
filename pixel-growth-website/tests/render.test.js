// tests/render.test.js
//
// Example / edge-case tests for the pure render helpers in js/render.js:
//   - escapeHtml: escapes the five HTML-significant characters, handles nullish
//   - renderButton: single shared `btn btn-cta` CTA markup with escaped values
//   - renderServiceCard: contains title + description, null for invalid input
//
// Covers Req 2.6 (single shared button style), 3.3 / 5.2 / 5.3 (service card
// content via a reusable component). These are example (unit) tests; the
// universal "service cards contain their content" property is covered
// separately by the property-based test in task 5.3.

import { describe, it, expect } from 'vitest';
import { escapeHtml, renderButton, renderServiceCard } from '../js/render.js';

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('escapes ampersands before other entities (no double-escaping)', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('returns empty string for null and undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('coerces non-string input to a string', () => {
    expect(escapeHtml(42)).toBe('42');
  });

  it('leaves safe text untouched', () => {
    expect(escapeHtml('Website Design')).toBe('Website Design');
  });
});

describe('renderButton (Req 2.6)', () => {
  it('produces an anchor with the single shared btn btn-cta class', () => {
    const html = renderButton('Contact Us', 'contact.html');
    expect(html).toContain('class="btn btn-cta"');
    expect(html.startsWith('<a')).toBe(true);
    expect(html).toContain('href="contact.html"');
    expect(html).toContain('>Contact Us<');
  });

  it('escapes the label to prevent markup injection', () => {
    const html = renderButton('<script>alert(1)</script>', 'contact.html');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes the href to prevent attribute breakout', () => {
    const html = renderButton('Go', 'a" onclick="x');
    expect(html).not.toContain('onclick="x"');
    expect(html).toContain('&quot;');
  });
});

describe('renderServiceCard (Req 3.3, 5.2, 5.3)', () => {
  const service = {
    id: 'website-design',
    title: 'Website Design',
    description: 'We design clean, responsive websites for small businesses.',
  };

  it('renders a service-card containing the title and description', () => {
    const html = renderServiceCard(service);
    expect(html).toContain('class="service-card"');
    expect(html).toContain('Website Design');
    expect(html).toContain('We design clean, responsive websites for small businesses.');
  });

  it('escapes title and description text content', () => {
    const html = renderServiceCard({
      title: 'A & B <x>',
      description: 'quote " and <tag>',
    });
    expect(html).toContain('A &amp; B &lt;x&gt;');
    expect(html).toContain('quote &quot; and &lt;tag&gt;');
    expect(html).not.toContain('<x>');
    expect(html).not.toContain('<tag>');
  });

  it('returns null when the service is missing', () => {
    expect(renderServiceCard(null)).toBeNull();
    expect(renderServiceCard(undefined)).toBeNull();
  });

  it('returns null when the title is missing or empty', () => {
    expect(renderServiceCard({ description: 'has description' })).toBeNull();
    expect(renderServiceCard({ title: '   ', description: 'x' })).toBeNull();
  });

  it('returns null when the description is missing or empty', () => {
    expect(renderServiceCard({ title: 'has title' })).toBeNull();
    expect(renderServiceCard({ title: 'x', description: '   ' })).toBeNull();
  });
});
