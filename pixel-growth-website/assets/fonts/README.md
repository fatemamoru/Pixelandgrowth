# Self-hosted fonts

The site self-hosts its two brand fonts instead of loading them from a
third-party CDN. This avoids an external dependency and gives full control
over the font-loading fallback (Requirements 2.2 and 2.3).

Both fonts are **free and open source** (SIL Open Font License), so hosting
them locally requires no paid service.

## Files in this folder

The `woff2` files are referenced by the `@font-face` rules in
`css/tokens.css`. Filenames must match exactly.

| File                              | Font             | Weight / style | Role                    |
| --------------------------------- | ---------------- | -------------- | ----------------------- |
| `playfair-display-600.woff2`      | Playfair Display | 600            | Headings (semi-bold)    |
| `playfair-display-700.woff2`      | Playfair Display | 700            | Headings (bold)         |
| `playfair-display-700-italic.woff2` | Playfair Display | 700 italic   | Tagline accents         |
| `inter-400.woff2`                 | Inter            | 400            | Body text               |
| `inter-500.woff2`                 | Inter            | 500            | Navigation, UI          |
| `inter-600.woff2`                 | Inter            | 600            | Buttons, labels         |

All are Latin-subset files from the Fontsource distribution:
`https://cdn.jsdelivr.net/fontsource/fonts/<family>@latest/latin-<weight>-<style>.woff2`

## How the fallback works

Every `@font-face` rule uses `font-display: swap`:

- Text renders **immediately** in the next available font (Inter, then
  Georgia / system-ui) instead of staying invisible while a font downloads.
- When Playfair Display finishes loading it **swaps in** for elements that use
  `--font-primary`.

If a file is missing, the site stays readable in the fallback fonts.