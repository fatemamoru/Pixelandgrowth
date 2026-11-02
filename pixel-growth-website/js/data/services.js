// js/data/services.js
// Single source of truth for the agency's five Service offerings (Req 5.1, 5.2, 3.3).
// Descriptions are real agency-offering copy with NO fabricated customer results,
// and are kept <= 200 chars so the same text works for both the Home services
// overview (Req 3.3, <= 200 chars) and the Services page (Req 5.2, <= 500 chars).

/**
 * @typedef {'website-design' | 'digital-marketing' | 'social-media' | 'seo' | 'technology'} ServiceId
 */

/**
 * @typedef {Object} Service
 * @property {ServiceId} id   Stable identifier for the service.
 * @property {string} title   Display name, 1–60 characters.
 * @property {string} description  Offering description, 1–500 chars (kept <= 200 for the home overview).
 */

/** @type {readonly Service[]} */
export const SERVICES = [
  {
    id: 'website-design',
    title: 'Website Design',
    description:
      'We design and build clean, responsive websites that reflect your brand and work smoothly on phones, tablets, and desktops.',
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    description:
      'We plan and run digital campaigns across search, email, and ads to help small businesses reach the right audience and grow.',
  },
  {
    id: 'social-media',
    title: 'Social Media Management',
    description:
      'We handle your social profiles with a steady content plan, scheduling, and engagement so your brand stays active and consistent.',
  },
  {
    id: 'seo',
    title: 'SEO',
    description:
      'We improve your site structure, content, and technical setup so it is easier for search engines and customers to find you.',
  },
  {
    id: 'technology',
    title: 'Technology Solutions',
    description:
      'We help with practical tech setup, integrations, and tooling so your online systems stay reliable and simple to maintain.',
  },
];
