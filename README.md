# Whisked Away (Next.js + Vercel + Shopify + Contentful)

A headless ecommerce demo built for a Vercel Partner Solutions Engineering interview panel.

- **Next.js (App Router)** powers the UI and routing (home, product listing, product detail, cart).
- **Shopify Storefront API** provides product data and the shopping cart.
- **Contentful (GraphQL)** provides homepage marketing content.
- **Vercel Edge Config** enables a production-only maintenance mode toggle.
- **Upstash Redis (Vercel Marketplace)** caches Shopify reads to reduce latency and API calls.
- **Tailwind CSS** for styling.

---

## Live Demo

- **Vercel deployment:** _https://whisked-away.vercel.app/_
- **GitHub repo:** _https://github.com/jmadden/whisked-away_

---

## Key Features

### Ecommerce (Shopify)

- Product listing page with pagination.
- Product detail page (variant selection and add-to-cart).
- Cart backed by Shopify Cart API.
- Cart ID stored in an **HttpOnly cookie** and reused across requests.

### CMS (Contentful)

- Home page pulls marketing content from Contentful:
  - `heroHeadline`
  - `heroSubhead`
  - `body` (plain text)

### Vercel Platform Features

- **Edge Config maintenance mode**: toggle `maintenanceMode` to rewrite all routes to `/maintenance` in production.
- **Upstash Redis caching**: Shopify product reads are cached with a TTL (configurable).

---

## Tech Stack

- Next.js (App Router)
- Vercel (deployment + preview builds)
- Shopify Storefront API (products + cart)
- Contentful GraphQL API (home page content)
- Upstash Redis (cache)
- Vercel Edge Config (maintenance toggle)
- Tailwind CSS

---

## Project Structure

```text
src/
  app/
    (marketing)/
      page.js                 # homepage (Contentful + featured Shopify products)
    (shop)/
      products/
        page.js               # product listing
      products/[handle]/
        page.js               # product detail
      cart/
        page.js               # cart view
    layout.js
    globals.css

  components/
    ProductCard.js
    ProductGrid.js
    AddToCartButton.js
    VariantSelector.js

  lib/
    shopify/
      client.js               # Storefront API fetch wrapper
      queries.js              # GraphQL queries
      read.js                 # read helpers (optionally cached)
    contentful/
      client.js               # Contentful GraphQL fetch wrapper
      queries.js              # GraphQL queries
      read.js                 # read helpers
    cart/
      actions.js              # Server Actions (create cart, add lines, etc)
      cookies.js              # cookie helpers (cartId)
    cache/
      kv.js                   # Upstash Redis JSON helpers (get/set)
    flags/
      edge-config.js          # Edge Config reads
```

---

## Local Development

### Prerequisites

- Node.js (via nvm is fine)
- A Shopify store with Storefront access token
- A Contentful space + environment + access token
- Upstash Redis database (via Vercel Marketplace)
- Vercel project linked to pull env vars

### Install dependencies

```bash
npm install
```

### Link to Vercel and pull env vars

```bash
vercel link
vercel env pull .env.development.local
```

### Run the dev server

```bash
npm run dev
```

Open: http://localhost:3000

---

## Environment Variables

These must exist in **Vercel Project Settings → Environment Variables** and locally via `.env.development.local`.

### Shopify

- `SHOPIFY_STORE_DOMAIN`  
  Example: `your-store.myshopify.com`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_API_VERSION`  
  Example: `2025-01` (or whatever you are targeting)

### Contentful

- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ENVIRONMENT` (optional, defaults to `master`)
- `CONTENTFUL_ACCESS_TOKEN`
- `CONTENTFUL_PREVIEW_ACCESS_TOKEN` (optional, only if using preview reads)

### Upstash Redis

Depending on your Upstash setup, you will typically have:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Your code uses:

```js
import { Redis } from '@upstash/redis';
const redis = Redis.fromEnv();
```

So it reads the above env vars automatically.

### Vercel Edge Config

When you connect Edge Config to the Vercel project, Vercel injects the required environment variables used by the Edge Config SDK.

---

## CMS Setup (Contentful)

This project expects a `MarketingPage` content type with an entry for the homepage.

### Required fields (recommended)

- `slug` (Short text)  
  Set to: `home`
- `heroHeadline` (Short text)
- `heroSubhead` (Short text)
- `body` (Long text, plain text)

### Optional: CMS-controlled featured products

If you want marketing to control featured product selection without code changes:

- Add a `featuredQuery` (Short text) field.

Example value:

- `tag:featured`

Then in Shopify, tag products with `featured` to have them appear in the Featured section.

---

## Shopify Setup Notes

### Storefront token

Create a Storefront access token in Shopify admin and set it as `SHOPIFY_STOREFRONT_ACCESS_TOKEN`.

### Featured products (recommended approach)

Use Shopify product tags:

- Add the tag `featured` to products you want to highlight.
- Query Shopify using `tag:featured`.

### Password-protected store

If your Shopify store is password-protected, some storefront/cart/checkout flows may not behave as expected outside Shopify’s hosted experience. For demo purposes:

- Product browsing and cart creation via Storefront API can still work.
- Checkout behavior may be limited depending on store settings.

---

## Image Configuration (Shopify + next/image)

If using `next/image`, ensure Shopify’s CDN is allowed in `next.config.js`:

```js
module.exports = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com' }],
  },
};
```

---

## Caching (Upstash Redis)

Shopify reads are cached in Upstash Redis to reduce repeated API calls and improve response times.

- Cache keys are namespaced.
- TTL is set in code (adjustable).
- Logs indicate cache hits/misses during development.

To adjust cache duration, update the TTL value in your cache helper or read layer.

---

## Maintenance Mode (Vercel Edge Config)

Production-only traffic can be rewritten to a `/maintenance` route using Vercel Edge Config.

- Edge Config key: `maintenanceMode`
- Values:
  - `true` → rewrite to `/maintenance`
  - `false` → normal routing

The rewrite logic runs only in production (by design), so local development is not affected.

---

## Deployment

This project is designed for Vercel.

Typical flow:

1. Push to GitHub
2. Vercel builds Preview Deployments on PRs
3. Merge to main triggers Production deployment

---

## Troubleshooting

### `next: command not found`

You are likely in the wrong directory or dependencies are not installed.

```bash
npm install
npm run dev
```

### Storefront API errors

Confirm:

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_API_VERSION`

Test in Insomnia first to validate token and endpoint.

### Contentful GraphQL field errors

If you change Contentful content model fields:

- Save changes
- Publish the entry again
- Restart the dev server

### Tailwind `@apply` warnings in Cursor

Cursor/VS Code may show editor warnings for Tailwind directives even if the build works. If needed, add:
`.vscode/settings.json`

```json
{
  "css.validate": false,
  "scss.validate": false,
  "less.validate": false
}
```

---

## Demo Script (Panel Friendly)

1. Home page

   - CMS-driven hero and body from Contentful
   - Featured products from Shopify

2. Products

   - Filtering + sorting + pagination
   - Mention cache and show logs for hit/miss

3. Product detail

   - Variant selection
   - Add to cart

4. Cart

   - Shopify cart state
   - Cookie-based cart persistence

5. Vercel feature highlight
   - Toggle `maintenanceMode` in Edge Config
   - Refresh production URL to show routing behavior changes

---

## License

MIT (or replace with your preference)
