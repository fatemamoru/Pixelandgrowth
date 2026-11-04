# Implementation Plan: Pixel & Growth Website

## Overview

This plan implements the Pixel & Growth five-page static website as a plain HTML5 + CSS3 (CSS custom properties) + vanilla JavaScript (ES modules) front-end with **no build step, no paid services, and no framework**. Work proceeds bottom-up and test-first: shared design tokens and pure logic modules (data, validation, render helpers, SEO checks) come first, each covered by property-based tests (Vitest + fast-check, minimum 100 iterations). The shared navigation and footer come from a single runtime-injected definition. The five pages are then assembled on top of that foundation and wired together, followed by responsive, accessibility, performance, and audit layers. Every task references the requirement sub-criteria it satisfies.

The implementation language is **JavaScript (ES modules)** as specified by the approved design — no language-selection question is required.

Hard constraints honored throughout (from Requirements): do NOT invent a business address, phone number, testimonials, customer results, or client history; portfolio items are labeled as demonstrations; and the contact form must not claim to work until it is connected and tested.

## Tasks

- [x] 1. Set up project scaffolding and no-build local toolchain
  - [x] 1.1 Create the directory and file skeleton
    - Create `pixel-growth-website/` with the five empty HTML files (`index.html`, `about.html`, `services.html`, `portfolio.html`, `contact.html`), `css/` (`tokens.css`, `base.css`, `components.css`), `js/` with `data/` subfolder, `assets/fonts/`, `assets/logo/`, `assets/img/`, and `tests/`
    - Confirm the structure matches the design's Project / File Structure section exactly (single source for nav/footer/tokens)
    - _Requirements: 12.1, 12.6, 12.2, 12.3, 12.4_

  - [x] 1.2 Configure the no-cost test toolchain
    - Add a minimal `package.json` with Vitest, fast-check, jsdom, and axe-core as dev dependencies and a `test` script using single-run mode (`vitest --run`)
    - Add a Vitest config using the jsdom environment so pure render/DOM functions can be tested
    - Document in a short README note how to serve the site over a no-cost local static server (e.g., `python -m http.server` or VS Code Live Server) and run tests, since nothing is compiled
    - _Requirements: 12.1, 12.6_

- [ ] 2. Define the shared design-token stylesheet (single styling source)
  - [x] 2.1 Implement `css/tokens.css` as the single source of truth
    - Declare the brand palette variables (deep navy `#0B1F3A`, warm gold `#C9A24B`, white `#FFFFFF`, ivory `#FAF7F0`, plus supporting shades), semantic color roles, the spacing scale, and breakpoint reference variables
    - Declare `--font-primary` (Playfair Display, then Inter fallback) and `--font-body` (Inter)
    - Ensure raw hex values and font-family names appear ONLY in this file
    - _Requirements: 2.1, 2.2, 12.4_

  - [x] 2.2 Set up self-hosted fonts with graceful fallback
    - Add `@font-face` rules for self-hosted Playfair Display and Inter `woff2` in `assets/fonts/`, using `font-display: swap` so the fallback renders immediately and Playfair Display swaps in when loaded
    - _Requirements: 2.2, 2.3_

  - [x] 2.3 Write property test for brand color contrast
    - **Property 13: Brand color pairings meet contrast thresholds**
    - Tag: `Feature: pixel-growth-website, Property 13: Brand color pairings meet contrast thresholds`
    - Generate over the declared (text color, background color) role pairings; assert ≥4.5:1 for normal body text and ≥3:1 for large text (min 100 iterations)
    - **Validates: Requirements 9.4**

- [x] 3. Implement content data modules (single source of content)
  - [x] 3.1 Implement `js/data/services.js`
    - Export exactly five Service entries (website design, digital marketing, social media management, SEO, technology solutions), each with `id`, `title` (1–60 chars), and `description` (1–500 chars, home overview copy ≤200 chars)
    - Use only real agency-offering descriptions — no fabricated customer results
    - _Requirements: 5.1, 5.2, 3.3_

  - [x] 3.2 Implement `js/data/portfolio.js`
    - Export between 3 and 12 Demonstration_Project entries, each with `id`, `title` (1–80 chars), `description` (1–500 chars), and illustrative image metadata (`webp`, `avif`, `alt`, `width`, `height`)
    - Mark all entries as demonstrations; include NO real client names, testimonials, or customer results
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 3.3 Write example tests for dataset cardinality and integrity
    - Assert services dataset has exactly five entries and portfolio dataset has 3–12 entries
    - Assert no portfolio entry contains fabricated client/testimonial fields
    - _Requirements: 5.1, 6.1, 6.4_

- [ ] 4. Implement pure validation logic for the contact form
  - [x] 4.1 Implement `js/validation.js`
    - Implement `validateRequired(fieldName, value)` returning a field-specific failure for whitespace-only/empty input
    - Implement `validateEmail(value)` that rejects malformed emails and accepts well-formed ones
    - Implement `buildSubmitResult(submission)` returning the "not yet connected" placeholder result that never claims the message was sent
    - _Requirements: 7.3, 7.4, 7.5, 7.6_

  - [x] 4.2 Write property test for required text fields
    - **Property 2: Required text fields reject whitespace-only input**
    - Tag: `Feature: pixel-growth-website, Property 2: Required text fields reject whitespace-only input`
    - Generate whitespace-only strings (including empty) across the name and message fields; assert a failure identifying that specific field as required (min 100 iterations)
    - **Validates: Requirements 7.3, 7.4**

  - [x] 4.3 Write property test for email validation
    - **Property 3: Email validation accepts well-formed emails and rejects malformed ones**
    - Tag: `Feature: pixel-growth-website, Property 3: Email validation accepts well-formed emails and rejects malformed ones`
    - Generate valid-email and arbitrary non-email strings; assert invalid flagged and valid accepted (min 100 iterations)
    - **Validates: Requirements 7.5**

  - [x] 4.4 Write property test for the not-yet-connected submit result
    - **Property 4: Valid submission with no connected handler yields a non-delivery placeholder**
    - Tag: `Feature: pixel-growth-website, Property 4: Valid submission with no connected handler yields a non-delivery placeholder`
    - Generate valid `ContactSubmission` records; assert the result is the placeholder confirmation and never asserts the message was sent (min 100 iterations)
    - **Validates: Requirements 7.6**

- [ ] 5. Implement pure render helpers (data in, markup out)
  - [x] 5.1 Implement `js/render.js` button and service card helpers
    - Implement `renderButton(label, href)` producing the single shared CTA markup/class
    - Implement `renderServiceCard(service)` returning markup containing the service title and description, or `null` for invalid input
    - _Requirements: 2.6, 3.3, 5.2, 5.3_

  - [x] 5.2 Implement portfolio card and list helpers in `js/render.js`
    - Implement `renderPortfolioCard(project)` producing markup with the persistent, non-interactive "Sample / Demonstration" label, or `null` when title or description is missing
    - Implement `renderPortfolioList(projects)` that renders only valid projects, preserving original relative order, and shows the "coming soon" empty-state message when none are valid
    - _Requirements: 6.2, 6.5, 6.6, 6.7_

  - [x] 5.3 Write property test for service card content
    - **Property 5: Service cards contain their content**
    - Tag: `Feature: pixel-growth-website, Property 5: Service cards contain their content`
    - Generate valid Service records (bounded lengths); assert markup contains title and description text (min 100 iterations)
    - **Validates: Requirements 3.3, 5.2**

  - [x] 5.4 Write property test for portfolio omission and ordering
    - **Property 6: Portfolio rendering omits invalid projects and preserves valid ones in order**
    - Tag: `Feature: pixel-growth-website, Property 6: Portfolio rendering omits invalid projects and preserves valid ones in order`
    - Generate lists mixing valid and title/description-missing records; assert only valid records render in original relative order (min 100 iterations)
    - **Validates: Requirements 6.7**

  - [x] 5.5 Write property test for demonstration label presence
    - **Property 7: Every rendered portfolio card carries the demonstration label**
    - Tag: `Feature: pixel-growth-website, Property 7: Every rendered portfolio card carries the demonstration label`
    - Generate valid Project records; assert each card's markup contains the visible non-interactive sample/demonstration label (min 100 iterations)
    - **Validates: Requirements 6.2**

- [ ] 6. Implement SEO metadata module and page-metadata source
  - [x] 6.1 Implement `js/seo.js` and the five-page metadata set
    - Define the five page metadata records (unique `<title>` 10–60 chars, unique `<meta description>` 50–160 chars) as a single source
    - Implement `checkSeo(metadata)` that reports which page and which element (title or description) is missing or out of range
    - _Requirements: 10.1, 10.2, 10.5_

  - [x] 6.2 Write property test for title bounds and uniqueness
    - **Property 8: Page titles are unique and length-bounded**
    - Tag: `Feature: pixel-growth-website, Property 8: Page titles are unique and length-bounded`
    - Assert each of the five titles is 10–60 chars and no two are identical (min 100 iterations)
    - **Validates: Requirements 10.1**

  - [x] 6.3 Write property test for meta description bounds
    - **Property 9: Page meta descriptions are length-bounded**
    - Tag: `Feature: pixel-growth-website, Property 9: Page meta descriptions are length-bounded`
    - Assert each description is non-empty and 50–160 chars (min 100 iterations)
    - **Validates: Requirements 10.2**

  - [x] 6.4 Write property test for the SEO checker
    - **Property 12: SEO checker identifies missing title or description**
    - Tag: `Feature: pixel-growth-website, Property 12: SEO checker identifies missing title or description`
    - Generate metadata records with omitted title/description; assert the failure identifies both the page and the missing element (min 100 iterations)
    - **Validates: Requirements 10.5**

- [ ] 7. Implement the shared navigation and footer component (single definition)
  - [x] 7.1 Implement `js/components.js` nav and footer rendering
    - Define `renderNav(currentPageKey)` producing exactly five links (one per page), the horizontal logo (icon left, name right), and exactly one active-state indicator matching the current page key, plus a collapsible mobile toggle button with `aria-expanded`/`aria-controls`
    - Define `renderFooter()` producing the business name "Pixel & Growth", the tagline "Build. Connect. Grow.", and links to all five pages
    - Inject both into the empty `data-component` landmarks on `DOMContentLoaded`, reading the page key from `body[data-page]`
    - _Requirements: 1.2, 1.3, 1.6, 1.7, 1.8, 1.9, 1.10, 2.4, 2.5, 8.2, 12.2, 12.3_

  - [x] 7.2 Add shared-element failure handling and no-JS fallback
    - On injection failure, render a visible "shared element unavailable" indication while preserving primary page content
    - Ensure each page's landmarks include `<noscript>` fallback nav links so navigation survives without JavaScript
    - _Requirements: 12.5_

  - [x] 7.3 Write property test for navigation links and active state
    - **Property 1: Navigation renders exactly five links with one correct active indicator**
    - Tag: `Feature: pixel-growth-website, Property 1: Navigation renders exactly five links with one correct active indicator`
    - Generate over all five page keys (exhaustive + sampled); assert exactly five links to the five page files and exactly one active link matching the key (min 100 iterations)
    - **Validates: Requirements 1.3, 1.6**

  - [x] 7.4 Write property test for navigation link text quality
    - **Property 11: Navigation link text is descriptive and non-generic**
    - Tag: `Feature: pixel-growth-website, Property 11: Navigation link text is descriptive and non-generic`
    - Assert each nav link's text is non-empty, has at least one visible word, and is not solely "click here"/"read more" (min 100 iterations)
    - **Validates: Requirements 10.4**

  - [x] 7.5 Write example test for footer content
    - Assert the footer contains the business name, the tagline, and five page links
    - _Requirements: 1.8_

- [x] 8. Checkpoint - foundation logic complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement base and component stylesheets
  - [x] 9.1 Implement `css/base.css`
    - Add resets, `box-sizing: border-box`, base body `font-size: 16px`, landmark/layout base, identical heading styles, and a visible `:focus-visible` outline
    - Reference only `tokens.css` variables — no raw hex or font names
    - _Requirements: 2.6, 8.4, 9.5_

  - [x] 9.2 Implement `css/components.css`
    - Style nav (horizontal logo, active-state indicator, mobile collapsible menu), footer, service cards, portfolio cards (with the sample label styling), buttons (single shared style), and form fields/validation messages
    - Keep button styling, heading styling, and spacing consistent across all pages
    - _Requirements: 2.6, 8.2, 9.5_

- [ ] 10. Assemble the five HTML pages
  - [x] 10.1 Build `index.html` (Home)
    - Set `body[data-page="home"]`, unique `<title>` + meta description, a single `<h1>`, and semantic landmarks with the empty nav/footer placeholders and `<noscript>` fallback links
    - Add Hero_Section (business name, tagline "Build. Connect. Grow.", CTA linking to Contact), introduction section, services overview (five service cards linking to Services), reasons-to-choose-us section (no fabricated results), and a contact CTA section
    - Link the shared CSS and load `components.js` plus a home page module as deferred ES modules
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 2.5, 9.3, 10.3_

  - [x] 10.2 Build `about.html` (About)
    - Set `body[data-page="about"]`, unique metadata, single `<h1>`, semantic landmarks, nav/footer placeholders and `<noscript>` fallback
    - Add intro (1–3 paragraphs), mission (≥1 paragraph), values (3–6 labeled values with 1–2 sentence descriptions), and approach (3–6 sequenced steps with title + description); omit fabricated history/clients/testimonials
    - Add per-section failure handling so a failing section shows an "unavailable" indication while others render
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.3, 10.3_

  - [x] 10.3 Build `services.html` (Services)
    - Set `body[data-page="services"]`, unique metadata, single `<h1>`, semantic landmarks, placeholders and fallback
    - Add `js/services-page.js` to render the five service cards via the reusable component and a CTA linking to Contact; on partial load failure render loaded entries plus an "one or more services unavailable" indication while keeping layout
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.3, 10.3_

  - [x] 10.4 Build `portfolio.html` (Portfolio)
    - Set `body[data-page="portfolio"]`, unique metadata, single `<h1>`, semantic landmarks, placeholders and fallback
    - Add `js/portfolio-page.js` to render demonstration cards via `renderPortfolioList` (sample labels, omit invalid, empty-state "coming soon" message)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 9.3, 10.3_

  - [x] 10.5 Build `contact.html` (Contact)
    - Set `body[data-page="contact"]`, unique metadata, single `<h1>`, semantic landmarks, placeholders and fallback
    - Add the Contact_Form with labeled fields name, email, business name, a service-of-interest `<select>` of the five Services, and message; add `js/contact.js` wiring `validation.js` for inline field-specific validation and the not-yet-connected placeholder confirmation
    - Include NO business address and NO phone number anywhere on the page
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 9.2, 9.3, 10.3_

  - [x] 10.6 Write property test for single non-empty H1 per page
    - **Property 10: Each page has exactly one non-empty top-level heading**
    - Tag: `Feature: pixel-growth-website, Property 10: Each page has exactly one non-empty top-level heading`
    - Render each of the five pages and assert exactly one `<h1>` with non-empty text (min 100 iterations)
    - **Validates: Requirements 10.3**

  - [x] 10.7 Write example tests for page-specific guarantees
    - Assert the Home hero shows the tagline and a CTA to Contact; the "no projects" state renders the coming-soon message; the Contact page contains no address/phone fields
    - _Requirements: 3.1, 2.5, 6.6, 7.7_

- [x] 11. Checkpoint - pages assembled
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement responsive layout
  - [x] 12.1 Add responsive CSS and mobile menu behavior
    - Implement mobile-first `min-width` media queries for mobile (320–767), tablet (768–1023), and desktop (≥1024); hide nav links behind the toggle below 768px and re-show at ≥768px; use fluid containers, `max-width:100%` images, and relative units to prevent horizontal scroll
    - Wire the mobile toggle in `components.js` to flip `aria-expanded` and show/hide links
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 4.7_

  - [x] 12.2 Write integration tests for responsive behavior
    - Assert the mobile toggle shows/hides links and flips `aria-expanded` below 768px; assert `scrollWidth <= clientWidth` at sampled widths 320–1920px; assert base body font-size ≥16px
    - _Requirements: 8.2, 8.3, 8.4, 4.7_

- [x] 13. Implement performance and image optimization
  - [x] 13.1 Optimize images and loading
    - Serve demonstration/hero images as WebP/AVIF via `<picture>` sized ≤1.5× display dimensions; set `loading="lazy"` on below-the-fold images and `loading="eager"` on the hero; declare intrinsic `width`/`height`; load JS as deferred ES modules
    - Add an `onerror` handler that swaps a placeholder within the image's reserved dimensions to prevent layout shift
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 13.2 Write example/audit tests for image handling and blocking
    - Assert `onerror` swaps the placeholder within reserved dimensions without layout shift; assert below-the-fold images use `loading="lazy"` and assets are WebP/AVIF sized ≤1.5× display; assert JS is loaded as deferred modules
    - _Requirements: 11.1, 11.2, 11.4, 11.5_

- [x] 14. Implement accessibility and SEO audits
  - [x] 14.1 Write accessibility audit tests
    - Run axe-core on the five pages; assert informational images have descriptive `alt` and decorative images have empty `alt`/presentation role; assert every form field has an associated visible label; assert header/nav/main/footer landmarks on each page; assert keyboard tab order reaches all nav links and form controls with a visible focus indicator
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [x] 14.2 Write SEO and consistency audit tests
    - Assert `checkSeo` passes for all five pages (unique titles, bounded descriptions, single H1, descriptive nav link text); assert computed-style consistency of headings, buttons, and spacing (within 2px) across the five pages
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 2.6_

- [x] 15. Implement static-analysis audits for brand and stack constraints
  - [x] 15.1 Write CSS and font audit tests
    - Scan CSS so hex color values appear only in `tokens.css` and all other color usage references variables; assert `@font-face` uses `font-display: swap` and the token font stack lists Playfair Display then Inter
    - _Requirements: 2.1, 2.2, 2.3, 12.4_

  - [x] 15.2 Write shared-component degradation test
    - Simulate a shared-component/stylesheet load failure and assert the page still renders primary content and shows the "shared element unavailable" indication with `<noscript>` fallback links present
    - _Requirements: 12.5_

- [x] 16. Final checkpoint - full verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional (tests) and can be skipped for a faster MVP, but they encode the design's 13 correctness properties and audit coverage; implementing them is strongly recommended for traceability.
- Each property-based test is a single test configured for a minimum of 100 iterations and tagged `Feature: pixel-growth-website, Property N: ...` per the design's Testing Strategy.
- Core implementation tasks (unmarked) build incrementally: tokens and pure logic first, then the shared component, then pages, then responsive/performance/a11y/SEO layers, ending with wiring and verification. No orphaned code — every module is integrated by the page assembly tasks.
- Hard content constraints are enforced in data and page tasks: no fabricated address, phone, testimonials, or client history; portfolio items labeled as demonstrations; contact form explicitly not-yet-connected.
- Run tests in single-run mode (`vitest --run`), not watch mode.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "3.1", "3.2"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.3", "4.1", "6.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "5.1", "6.2", "6.3", "6.4"] },
    { "id": 4, "tasks": ["5.2", "5.3", "7.1"] },
    { "id": 5, "tasks": ["5.4", "5.5", "7.2", "7.3", "7.4", "7.5", "9.1"] },
    { "id": 6, "tasks": ["9.2", "10.1", "10.2", "10.3", "10.4", "10.5"] },
    { "id": 7, "tasks": ["10.6", "10.7", "12.1", "13.1"] },
    { "id": 8, "tasks": ["12.2", "13.2", "14.1", "14.2", "15.1", "15.2"] }
  ]
}
```
