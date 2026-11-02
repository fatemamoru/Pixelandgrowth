// tests/data.test.js
//
// Example tests for content-dataset cardinality and integrity.
//
// Covers:
//   - Services dataset has exactly five entries (Req 5.1) with bounded
//     title/description lengths (Req 5.2).
//   - Portfolio dataset has between 3 and 12 entries (Req 6.1) with bounded
//     title/description lengths (Req 6.3) and complete image metadata.
//   - No portfolio entry carries fabricated client/testimonial/result fields
//     (Req 6.4).
//
// These are example (unit) tests, not property-based tests.

import { describe, it, expect } from 'vitest';
import { SERVICES } from '../js/data/services.js';
import { PROJECTS } from '../js/data/portfolio.js';

describe('SERVICES dataset (Req 5.1, 5.2)', () => {
  it('has exactly five entries', () => {
    expect(SERVICES).toHaveLength(5);
  });

  it('exposes the five expected service ids', () => {
    expect(SERVICES.map((s) => s.id)).toEqual([
      'website-design',
      'digital-marketing',
      'social-media',
      'seo',
      'technology',
    ]);
  });

  it('gives every service a unique id', () => {
    const ids = SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every service a title of 1–60 characters', () => {
    for (const service of SERVICES) {
      expect(typeof service.title).toBe('string');
      expect(service.title.length).toBeGreaterThanOrEqual(1);
      expect(service.title.length).toBeLessThanOrEqual(60);
    }
  });

  it('gives every service a description of 1–200 characters (home overview limit)', () => {
    for (const service of SERVICES) {
      expect(typeof service.description).toBe('string');
      expect(service.description.length).toBeGreaterThanOrEqual(1);
      // Req 3.3 keeps the home overview copy <= 200 chars; the stricter bound
      // is also well within the Services-page 1–500 allowance (Req 5.2).
      expect(service.description.length).toBeLessThanOrEqual(200);
    }
  });
});

describe('PROJECTS dataset (Req 6.1, 6.3)', () => {
  it('has between 3 and 12 entries', () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(3);
    expect(PROJECTS.length).toBeLessThanOrEqual(12);
  });

  it('gives every project a unique id', () => {
    const ids = PROJECTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every project a title of 1–80 characters', () => {
    for (const project of PROJECTS) {
      expect(typeof project.title).toBe('string');
      expect(project.title.length).toBeGreaterThanOrEqual(1);
      expect(project.title.length).toBeLessThanOrEqual(80);
    }
  });

  it('gives every project a description of 1–500 characters', () => {
    for (const project of PROJECTS) {
      expect(typeof project.description).toBe('string');
      expect(project.description.length).toBeGreaterThanOrEqual(1);
      expect(project.description.length).toBeLessThanOrEqual(500);
    }
  });

  it('gives every project complete image metadata', () => {
    for (const project of PROJECTS) {
      expect(project.image).toBeTypeOf('object');
      expect(project.image).not.toBeNull();

      const { webp, avif, alt, width, height } = project.image;
      expect(typeof webp).toBe('string');
      expect(webp.length).toBeGreaterThan(0);
      expect(typeof avif).toBe('string');
      expect(avif.length).toBeGreaterThan(0);
      expect(typeof alt).toBe('string');
      expect(alt.length).toBeGreaterThan(0);
      expect(typeof width).toBe('number');
      expect(width).toBeGreaterThan(0);
      expect(typeof height).toBe('number');
      expect(height).toBeGreaterThan(0);
    }
  });
});

describe('PROJECTS integrity — no fabricated client content (Req 6.4)', () => {
  // Portfolio entries must never carry fabricated client identities,
  // testimonials, or customer results. Enforce this structurally by banning
  // the field names that would carry such content.
  const FORBIDDEN_KEYS = ['testimonial', 'clientName', 'client', 'result'];

  it('has no forbidden client/testimonial/result keys on any entry', () => {
    for (const project of PROJECTS) {
      for (const key of FORBIDDEN_KEYS) {
        expect(project).not.toHaveProperty(key);
      }
    }
  });
});
