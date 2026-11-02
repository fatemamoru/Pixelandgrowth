# Self-hosted fonts

The site self-hosts its two brand fonts instead of loading them from a
third-party CDN. This avoids an external dependency and gives us full control
over the font-loading fallback behavior (Requirements 2.2 and 2.3).

Both fonts are **free and open source** (SIL Open Font License), so hosting
them locally requires no paid service.

## Required files

Place the following `woff2` files directly in this `assets/fonts/` directory.
The filenames must match exactly — they are referenced by the `@font-face`
rules in `css/tokens.css`.

| File                 | Font    | Weight | Role                          |
| -------------------- | ------- | ------ | ----------------------------- |
| `poppins-400.woff2`  | Poppins | 400    | Primary — regular             |
| `poppins-600.woff2`  | Poppins | 600    | Primary — semi-bold headings  |
| `poppins-700.woff2`  | Poppins | 700    | Primary — bold headings       |
| `inter-400.woff2`    | Inter   | 400    | Body / fallback — regular     |
| `inter-500.woff2`    | Inter   | 500    | Body / fallback — medium      |
| `inter-700.woff2`    | Inter   | 700    | Body / fallback — bold        |

> The `.woff2` binaries are intentionally not committed to the repository.
> Download them and drop them in here before serving the site.

## Where to download

- **Poppins** — https://fonts.google.com/specimen/Poppins
- **Inter** — https://fonts.google.com/specimen/Inter

You can download the full families from Google Fonts (or the Inter site at
https://rsms.me/inter/) and export the needed weights to `woff2`. A free,
no-install option for converting/subsetting to `woff2` is
https://gwfh.mranftl.com/fonts (google-webfonts-helper), which lets you pick
the exact weights above and download ready-to-use `woff2` files.

## How the fallback works

Every `@font-face` rule in `css/tokens.css` uses `font-display: swap`:

- Text renders **immediately** in the next available font (Inter, then
  `system-ui`) rather than staying invisible while a font downloads.
- When Poppins finishes loading, it **swaps in** for elements that use
  `--font-primary`.

Because of this, the site stays readable even if these files are missing —
it simply renders in Inter / the system sans-serif until the files are added.
