# Personal Portfolio

Minimal, modern personal site for a 22-year-old Master's student. Includes:

- About
- Projects (with external links)
- Coursework
- Work Experience
- Stories
- Contact

## Getting started

Open `index.html` directly, or serve locally:

```powershell
cd C:\Users\Aaron\OneDrive\Documents\GitHub\personal-portfolio
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Customize

- Update name, email, and links in `index.html`.
- Replace placeholder project cards and lists with your content.
- Adjust colors in `styles.css` (`--brand`, `--accent`).
- Toggle default theme by adding or removing the `light` class on `:root` in `script.js` storage logic.

## Deploy

- GitHub Pages: push `main` branch and enable Pages for the repo (root).
- Netlify/Vercel: import the repo; set build command to none, output to `/`.

## Accessibility

- Includes a skip link, semantic landmarks, high-contrast colors, and prefers-reduced-motion friendly smooth scrolling.

## License

MIT
