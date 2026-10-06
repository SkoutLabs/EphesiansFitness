# Ephesians Fitness

An Angular 21 + PrimeNG 21 storefront rebuilt from the existing Ephesians Fitness website. Includes Home, Store, About, FAQ and Checkout routes, the original deep green and cream theme, responsive navigation, product search and categories, product options and a device-local shopping bag.

## Run locally

Requires Node.js 22.12+ (tested with 22.15) and npm.

```powershell
npm.cmd install
npm.cmd run server
```

In a second terminal:

```powershell
npm.cmd start
```

Open http://localhost:4200. On macOS/Linux, use `npm` instead of `npm.cmd`.

```powershell
npm.cmd run check
npm.cmd run build
```

The production frontend is generated in `dist/ephesians-fitness/browser`. Configure the web host to serve `index.html` for application routes such as `/store`, `/about`, `/faq` and `/checkout`. Checkout also requires the Node backend and a same-origin `/api` reverse proxy. No deployment or existing-domain changes have been made.

## Structure

```text
src/app/core/        Product catalogue and local shopping-bag service
src/app/pages/       Home, Store, About, FAQ and not-found pages
src/app/shared/      Product cards and PrimeNG product dialog
src/app/             Application shell and route configuration
src/styles.scss      Responsive visual design
public/images/       Original product images, stored locally
docs/source/         Original public pricing snapshot
tools/               Catalogue import and browser validation
```

## Content and ordering

The 17 unique products, prices, size/style/colour options, original product images, brand story, contact information and support policies were obtained from https://ephesians-fitness.co.za on 6 October 2026. Duplicate products in the original catalogue were removed. The catalogue snapshot is `src/app/core/products.json`; edit it to update prices or options. Images show original designs and do not change when a different colour is selected. Confirm actual stock and sizes with the business.

The bag uses localStorage on the visitor’s device. **Review & checkout** opens delivery details and an order summary. The Node backend validates products and prices, saves the order, and prepares the customer's EFT payment email and business notification. Default local mode stores email previews and keeps the bag, sending nothing. Configure verified banking information and Gmail OAuth2 or SMTP in private `server/.env` to enable live email. See [checkout setup and original-code review](docs/checkout.md). EFT payment confirmation is manual; card payments, inventory reservation and the old administrator/accounts system are not connected. **Ask the team by email** remains available for enquiries.

R50 delivery and free delivery for product subtotals **greater than** R800 follow the original website. The source lists 7–14 business days on its support page; verify the current delivery estimate and policies before launching.

All website copy is in English, matching the source. The new monogram is a provisional text-based brand mark; replace it with official artwork if available.

## Browser checks

With both local servers running in preview mode, execute `node tools/browser-check.cjs`. It uses installed Google Chrome through Playwright and checks routes, images, search, category filters, product options, bag persistence and shipping totals, FAQ panels, mobile navigation and a checkout using fictitious customer details. Screenshots are written to `docs/preview/`. Run `npm.cmd run test:checkout` for server validation, email retry and idempotency tests.
