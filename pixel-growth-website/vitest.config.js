import { defineConfig } from 'vitest/config';

// Vitest configuration for the Pixel & Growth static site.
// The jsdom environment lets pure render/DOM helper functions and page
// markup be exercised without a browser. Nothing here is compiled or bundled;
// Vitest only runs the test files under tests/.
export default defineConfig({
  test: {
    // jsdom provides a DOM for rendering pure component functions and
    // auditing page markup (see design.md Testing Strategy).
    environment: 'jsdom',
    // Collect tests from the tests/ directory and any co-located *.test.js files.
    include: ['tests/**/*.{test,spec}.js', '**/*.{test,spec}.js'],
  },
});
