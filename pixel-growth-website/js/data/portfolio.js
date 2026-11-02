// js/data/portfolio.js
//
// Single source of truth for the Portfolio page's Demonstration_Projects.
//
// Every entry here is an ILLUSTRATIVE DEMONSTRATION only. It describes the
// *kind* of work Pixel & Growth produces using invented, generic sample
// scenarios. It intentionally contains:
//   - NO real client names
//   - NO testimonials
//   - NO customer results, metrics, or success claims
// (Requirement 6.4). The Portfolio page renders these with a persistent,
// non-interactive "Sample / Demonstration" label (Requirement 6.2).
//
// Cardinality: 3–12 entries (Requirement 6.1).
// title: 1–80 characters; description: 1–500 characters (Requirement 6.3).
// Each entry carries illustrative image metadata with intrinsic width/height
// so cards can reserve space and avoid layout shift (Requirement 11.5).

/**
 * @typedef {Object} ProjectImage
 * @property {string} webp   Path to the WebP source (web-optimized).
 * @property {string} avif   Path to the AVIF source (web-optimized).
 * @property {string} alt    Descriptive alternative text for the image.
 * @property {number} width  Intrinsic image width in pixels.
 * @property {number} height Intrinsic image height in pixels.
 */

/**
 * @typedef {Object} Project
 * @property {string} id          Stable identifier for the demonstration project.
 * @property {string} title       Project title (1–80 chars).
 * @property {string} description Project description (1–500 chars).
 * @property {ProjectImage} image Illustrative image metadata.
 */

/**
 * Between 3 and 12 Demonstration_Project entries (Requirement 6.1).
 * Each is a clearly illustrative sample — not real client work.
 * @type {Project[]}
 */
export const PROJECTS = [
  {
    id: 'demo-local-bakery',
    title: 'Sample: Neighborhood Bakery Website',
    description:
      'A demonstration brand-and-build concept for an imagined local bakery. Shows a warm, inviting homepage, a visual menu layout, and a mobile-first ordering call-to-action. Presented to illustrate how a small food business could look online — all content is invented for display purposes.',
    image: {
      webp: 'assets/img/project-1.webp',
      avif: 'assets/img/project-1.avif',
      fallbackSrc: 'assets/img/project-1.svg',
      alt: 'Demonstration mockup of a neighborhood bakery website homepage.',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'demo-fitness-studio',
    title: 'Sample: Boutique Fitness Studio Landing Page',
    description:
      'An illustrative landing-page concept for a fictional boutique fitness studio. Demonstrates a bold hero section, class-schedule layout, and a clear sign-up flow designed to turn visitors into trial bookings. Shown as a design example only; no real studio or data is represented.',
    image: {
      webp: 'assets/img/project-2.webp',
      avif: 'assets/img/project-2.avif',
      fallbackSrc: 'assets/img/project-2.svg',
      alt: 'Demonstration mockup of a boutique fitness studio landing page.',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'demo-coffee-brand',
    title: 'Sample: Independent Coffee Roaster Brand Kit',
    description:
      'A demonstration brand-identity concept for an imagined independent coffee roaster. Illustrates logo direction, a cohesive color system, packaging mockups, and social-post templates that work together across channels. Created purely as a sample to show visual-identity work.',
    image: {
      webp: 'assets/img/project-3.webp',
      avif: 'assets/img/project-3.avif',
      fallbackSrc: 'assets/img/project-3.svg',
      alt: 'Demonstration mockup of an independent coffee roaster brand kit.',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'demo-handmade-shop',
    title: 'Sample: Handmade Goods Online Store',
    description:
      'An example e-commerce storefront concept for a fictional handmade-goods maker. Demonstrates a clean product grid, a focused product detail page, and a streamlined checkout layout optimized for small inventories. All products and copy are invented for demonstration.',
    image: {
      webp: 'assets/img/project-4.webp',
      avif: 'assets/img/project-4.avif',
      fallbackSrc: 'assets/img/project-4.svg',
      alt: 'Demonstration mockup of a handmade goods online store product grid.',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'demo-consulting-site',
    title: 'Sample: Small Consulting Firm Website',
    description:
      'A demonstration website concept for an imagined small consulting firm. Shows a professional services layout, a clear "how we work" section, and a contact-focused structure designed to build trust with prospective clients. Presented as an illustrative example only.',
    image: {
      webp: 'assets/img/project-5.webp',
      avif: 'assets/img/project-5.avif',
      fallbackSrc: 'assets/img/project-5.svg',
      alt: 'Demonstration mockup of a small consulting firm website.',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'demo-restaurant-social',
    title: 'Sample: Family Restaurant Social Media Refresh',
    description:
      'An illustrative social-media design concept for a fictional family restaurant. Demonstrates a consistent template system for daily specials, event announcements, and behind-the-scenes posts that keep a feed cohesive and on-brand. Shown as a sample; no real restaurant is depicted.',
    image: {
      webp: 'assets/img/project-6.webp',
      avif: 'assets/img/project-6.avif',
      fallbackSrc: 'assets/img/project-6.svg',
      alt: 'Demonstration mockup of a family restaurant social media template set.',
      width: 1200,
      height: 800,
    },
  },
];
