# Validation

Completed locally on 6 October 2026 with Node 22.15.0, Angular 21.2.25 and PrimeNG 21.1.3.

- `npm.cmd run build`: production build passes; routes are lazy loaded.
- `npm.cmd run check`: strict TypeScript checks pass.
- `npm.cmd audit fix`: audit reports zero known vulnerabilities.
- `node tools/browser-check.cjs`: passes in headless installed Chrome.

Browser verification covers all four pages and the not-found page; 17 unique products; category navigation; search and empty results; size selection; adding, increasing and removing basket items; basket restoration after reload; R50 shipping at an R800 subtotal and free shipping above R800; correct prefilled email enquiry details; FAQ expansion; mobile navigation; no horizontal overflow at 390px and 1440px; no browser runtime errors. Local product assets load successfully.

Desktop and mobile Home screenshots and a desktop Store screenshot are in `docs/preview/`. No emails were sent, purchases made, or production website changes published.

## Checkout and colour update

The Royal Blue and gold theme and checkout have been verified in a new production build. `npm.cmd run check` passes. All four checkout server tests pass: authoritative pricing and shipping, validation/HTML escaping, retrying only failed emails, and concurrent/idempotent order creation. The browser suite additionally passes delivery form validation and complete preview checkout at desktop/mobile widths. Checkout screenshots are in `docs/preview/`; two locally saved email previews are in ignored `server/data/email-previews/`. Gmail/SMTP credentials and live inbox delivery were not tested. The API remains in preview mode.
