# Scale-O Schema Guide (simple)

What we added, where it shows, why, and how to check.

---

## What is schema / JSON-LD?

Schema is hidden code in the page (`application/ld+json`) that tells Google:

- what the page is (product, blog, FAQ, business)
- price, stock, ratings
- breadcrumb path
- business address and phone

Users do not see it. Google uses it for rich results (stars, FAQ, breadcrumbs, etc.).

---

## Schema we made (ticket map)


| Ticket item             | Schema type                        | Status                              |
| ----------------------- | ---------------------------------- | ----------------------------------- |
| Breadcrumb              | `BreadcrumbList`                   | Done                                |
| Blog / Article          | `BlogPosting`                      | Done                                |
| FAQ                     | `FAQPage`                          | Done                                |
| Review / Rating         | `aggregateRating` inside `Product` | Done                                |
| Local business          | `LocalBusiness`                    | Done                                |
| Product + price + stock | `Product` + `Offer`                | Done                                |
| Blog article 5          | Content (Admin publish)            | Paste pack ready — publish in Admin |



| Extra                      | Schema type    |
| -------------------------- | -------------- |
| Company                    | `Organization` |
| Site search                | `WebSite`      |
| CMS pages                  | `WebPage`      |
| Mini / Semi / Centi family | `ProductGroup` |


---



## Which page shows which schema


| Page                                          | Schemas shown                                                                                                                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Homepage**                                  | Organization, LocalBusiness, WebSite, FAQPage (if FAQ section is on)                                                                                                      |
| **Product (PDP)**                             | Organization, WebSite, BreadcrumbList, Product, Offer (price + stock), aggregateRating (if reviews exist), ProductGroup (Mini/Semi/Centi), FAQPage (if FAQ section is on) |
| **Collection**                                | Organization, WebSite, BreadcrumbList, FAQPage (if FAQ section is on)                                                                                                     |
| **Blog post**                                 | Organization, WebSite, BreadcrumbList, BlogPosting, FAQPage (if FAQ headings exist in body)                                                                               |
| **Blog index**                                | Organization, WebSite, BreadcrumbList                                                                                                                                     |
| **City / CMS pages**                          | Organization, WebSite, BreadcrumbList, WebPage, FAQPage (city FAQ HTML), LocalBusiness only on Ahmedabad / contact / about                                                |
| **Other city pages** (Bangalore, Delhi, etc.) | No LocalBusiness (no fake store address)                                                                                                                                  |


Homepage has no breadcrumb schema (Home has no trail). That is correct.

---



## Why each schema (short)


| Schema              | Why                                                              |
| ------------------- | ---------------------------------------------------------------- |
| **BreadcrumbList**  | Google can show Home > Collection > Product in search            |
| **BlogPosting**     | Google understands blog title, date, author, image               |
| **FAQPage**         | Can show FAQ dropdown in search (only if Q&A is visible on page) |
| **Product + Offer** | Price, currency, InStock / OutOfStock for product rich results   |
| **aggregateRating** | Star ratings in search (real reviews only)                       |
| **LocalBusiness**   | HQ NAP (name, address, phone) for local trust — Ahmedabad only   |
| **Organization**    | Brand identity sitewide                                          |
| **WebSite**         | Site name + search box support                                   |


---



## HQ details used in schema

**Address**  
C-101, Titanium Business Park, Nr Corporate Road, Makarba, Ahmedabad, Gujarat, India - 380051

**Sales**  
+91 9909963304 · [sales@scale-o.com](mailto:sales@scale-o.com)

**Support**  
+91 9909963300 · [support@scale-o.com](mailto:support@scale-o.com)

Edit later in: **Theme settings → Store contact** (no code needed).

---



## How to check (simple)



### 1. Fast check (browser)

1. Open the page (preview or live)
2. Right click → **View page source**
3. Search: `application/ld+json`
4. Confirm you see types like `Product`, `FAQPage`, `BreadcrumbList`, `LocalBusiness`, `BlogPosting`



### 2. Best check (Google)

1. Open [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Paste the live URL
3. Look for valid:
  - Product
  - Review
  - FAQ
  - Breadcrumbs
  - Local business (home / Ahmedabad)
  - Article (blog)



### 3. After go-live

Google Search Console → **Enhancements** / **Experience** reports for Product, FAQ, Review, Breadcrumbs.

---



## Files (for developers)


| File                                        | What it does                                    |
| ------------------------------------------- | ----------------------------------------------- |
| `snippets/scale-o-structured-data.liquid`   | Organization, LocalBusiness, WebSite, WebPage   |
| `snippets/scale-o-breadcrumb-schema.liquid` | BreadcrumbList                                  |
| `snippets/scale-o-html-faq-schema.liquid`   | FAQPage from article / city HTML                |
| `sections/scale-o-faq.liquid`               | FAQPage on home / collection / PDP              |
| `sections/article.liquid`                   | BlogPosting + article FAQ                       |
| `snippets/product-data.liquid`              | Product, Offer, rating, ProductGroup            |
| `snippets/dadao_reviews_core.liquid`        | Extra review JSON-LD disabled (avoid duplicate) |


---



## Do / Don’t

**Do**

- Keep FAQ text visible on the page if FAQ schema is used
- Use real reviews only
- Fill HQ street + PIN in theme settings (already set)
- Publish Blog 5 from `docs/scale-o-blog-5-hard-water-geyser-washing-machine.md`

**Don’t**

- Don’t invent LocalBusiness addresses for other cities
- Don’t turn on old unused Product schema snippets (duplicates hurt rich results)
- Don’t put FAQ schema for questions that are not on the page
- Don’t hard-code fake star ratings

---



## Ticket remaining (not schema code)

1. **Publish Blog 5** in Shopify Admin (paste pack is ready)
2. **Push theme live** so production has this schema
3. Run Rich Results Test on live URLs
4. Optional: reciprocal “read next” link between Blog 5 and the old appliances post

---



## One-line summary

Schema for Breadcrumb, Blog, FAQ, Review, LocalBusiness, and Product is in the theme and verified on preview. Blog article 5 still needs Admin publish + theme push to live.
