# VideoListAI — Landing Page

Cinematic AI real estate video listings. One-page landing site.

## Deploy

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → New Project → Import this repo
3. No build configuration needed — Vercel auto-detects static HTML
4. Click Deploy

## File Structure

```
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── README.md
```

## What to Replace

| Placeholder | Location | Replace With |
|---|---|---|
| Video sources `src="#"` | index.html — 3 video elements | Your actual video file URLs or embed links |
| Video poster images | index.html — 3 `poster` attributes | Screenshots from your actual videos |
| Instagram URL | index.html — contact section `href` | Your Instagram profile URL |
| Phone number | index.html — `tel:+1XXXXXXXXXX` and display text | Your real phone number |
| Formspree endpoint | index.html — form `action` | Your Formspree form URL (free at formspree.io) |

## Third-Party Connectors

- **Forms**: [Formspree](https://formspree.io) — free, no backend needed
- **Analytics**: Add [Plausible](https://plausible.io) or GA4 script tag to `<head>`
- **Booking**: Embed [Calendly](https://calendly.com) widget in contact section if preferred over form

## Browser Support

Chrome, Safari, Firefox, Edge — last 2 versions. Mobile-first responsive from 320px to 2560px.
