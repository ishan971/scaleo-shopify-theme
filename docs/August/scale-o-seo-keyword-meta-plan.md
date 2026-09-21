# Scale-O SEO Keyword, Meta Title & Description Plan

**Prepared for:** Scale-O (scale-o.com)  
**Prepared by:** PeakPilots  
**Platform:** Shopify  
**Date:** 18 August 2026  
**Scope:** D2C residential (independent houses, villas, bungalows with overhead tanks)  
**Code changes:** None. This is a Shopify Admin / Theme Editor content document only.

---

## 1. Direct answers (read this first)

### Can you change the meta title and meta description?

**Yes.** You can change both on every product, collection, page, and blog post from Shopify Admin. You do **not** need a developer and you do **not** need to edit theme code.

Shopify path:

1. Go to **Shopify Admin**
2. Open the item:
   - Product → **Products** → open product
   - Collection → **Products → Collections** → open collection
   - Page → **Online Store → Pages** → open page
   - Blog → **Online Store → Blog posts** → open post
3. Scroll to **Search engine listing**
4. Click **Edit**
5. Fill **Page title** (meta title) and **Description** (meta description)
6. Click **Save**
7. Check the live page with View Source or [Google Rich Results Test](https://search.google.com/test/rich-results)

Recommended lengths:

| Field | Target | Why |
|---|---|---|
| Meta title | **50–60 characters** | Google typically shows ~50–60 chars on mobile |
| Meta description | **145–160 characters** | Google typically shows ~150–160 chars |
| URL handle | short, keyword, no `copy-of` | Crawlers and CTR |

If the SEO fields are left blank, Shopify uses the product/page title and often **no unique description**. Many Scale-O pages currently fall back to the homepage promo text. That is a ranking and CTR problem.

### Can you add Primary Keywords and Secondary Keywords?

**Yes for strategy. No as a special Shopify field.**

Google **does not use** the old `<meta name="keywords">` tag. Shopify also has **no “Primary Keyword” or “Secondary Keyword” box**.

You add keywords by placing them in real ranking places:

| Place | Primary keyword | Secondary keywords |
|---|---|---|
| Meta title | Must appear near the front | Optional 1 supporting term |
| Meta description | Once, naturally | 1–2 related terms + benefit |
| H1 | Once | No |
| First 100 words of body | Once | 1–2 |
| H2 / H3 | One H2 uses primary or close variant | Rest of H2s |
| FAQ questions | Question-style variants | Yes |
| Image ALT | Product + use case | Light |
| URL handle | Primary or close variant | No stuffing |
| Internal links | Anchor text | Related terms |

**Rule used in this document:** one **primary keyword = one URL**. Two pages must not target the same primary keyword (that is cannibalization).

---

## 2. How this research was done

Live titles, descriptions, H1s, and canonicals were pulled from scale-o.com on **18 Aug 2026**.

Keyword targeting was built from:

- Live competitor SERPs in India: KENT, Aquaguard, RiverSoft, Hard2Soft, LSOMM Aqua, Doctor Fresh, HouseGyan-style “best of” pages
- India buyer language: *water softener for home*, *overhead tank*, *bathroom water softener*, *hard water hair fall*, *geyser scale*, *borewell water*
- Market direction: India water-softener category is growing (~7–8% CAGR). Salt-based still dominates volume; **salt-free / low-maintenance / tank-insert** is the fastest-growing niche Scale-O can actually win
- Search intent: commercial and problem queries beat brand-only titles like “Scale-O” or “About Us”

**Volume note:** Exact India monthly search volume (MSV) is behind Google Ads Keyword Planner / Ahrefs / Semrush logins. Public tools do not publish a stable open dataset. Numbers below are **India estimated monthly search bands** (Aug 2026 research), based on SERP density, competitor bidding, Google Trends relative interest, and typical Keyword Planner ranges for this category.

Lock exact numbers in **Google Search Console + Keyword Planner (India)** in Week 1. Do not delay on-page work while waiting for a paid tool export.

Volume bands used in this doc:

| Band | Est. India searches / month | Use |
|---|---|---|
| Very High | 5,000+ | Brand-home + category; hard to rank fast |
| High | 1,500–5,000 | Main commercial targets |
| Medium | 400–1,500 | Best Month-1 ranking opportunities |
| Low–Med | 80–400 | High-intent, easier to rank |
| Low | under 80 | Long-tail / brand / support |

**Scale-O ranking strategy:** do not only chase the biggest head term (*water softener*). Win **high-intent Medium / Low–Med** terms first (*salt-free water softener*, *water softener for overhead tank*, city + tank queries), then build toward *water softener for home*.

---

## 3. Current site-wide SEO problems

These issues showed up on the live site. They hurt rankings even if you later write perfect blogs.

### 3.1 Meta title problems

| Problem | Live example | Why it hurts |
|---|---|---|
| Brand-only title, no keyword | Homepage: `Scale-O` (7 chars) | Google cannot match a buying query |
| Generic CMS title | `About Us`, `Customers`, `Book Trial`, `Products` | Zero commercial intent |
| Lowercase / unedited handle title | `water softener plans` | Looks unfinished in SERP |
| Duplicate collections fighting each other | `/collections/water-softeners`, `/collections/all`, `/collections/all-products`, `/collections/water-softener-for-house` | Splits ranking power |
| Spec dump, no search query | `Nano Water Softener`, `Ultra Water Softener` | Nobody searches those model names |
| Title a bit long | Mini/Semi/Centi at 65–66 chars | May truncate on mobile |
| HTML entity in title | Hyderabad: `Home &amp; Overhead Tanks` | Looks broken in some SERPs |
| Wrong H1 vs SEO title | Collection H1 crawled as `Before vs After Using Scale-O` | Confuses relevance |

### 3.2 Meta description problems

| Problem | Live example | Why it hurts |
|---|---|---|
| Missing description | About, Plans, Competitors, Customers, Consult, many collections | Google auto-snippets random body text |
| Homepage promo reused everywhere | Legal Policy, Exchange Policy, Book Trial, Become a Retailer, Collaborate as Brand, Blog index | Policies look like ads; blog looks like a sale page |
| Unverified claim | `Trusted by 2L+ families` | Risk if not provable; also not keyword-rich |
| Coupon in SEO description | `Flat INR 500/- off` | Dates poorly; wastes characters |
| Too long | Mini combo 170 chars, Centi combo 172, Hyderabad 200 | Truncates |
| Too short / internal note | Nano: `For Trials Only \|\| Micro Size` | Not a search snippet |

### 3.3 Other ranking blockers (not meta, but they cap results)

- **Sold Out** on core Mini / Semi / Centi cards (negative ranking + conversion signal)
- Dirty URL: `/pages/copy-of-shop-by-purpose-r2` titled `Shop by Purpose R2`
- Duplicate product URLs exist (`/products/scale-o-semi` and `/products/semi-water-softener-1000l-1500l-tanks`) — canonicals currently point to the longer URL (good). Keep 301s.
- Partner/industrial templates exist in the theme; several live URLs 404 (`/pages/industrial`, `/pages/commercial`, `/pages/faqs`, `/pages/contact`)
- Bangalore city page template exists; tested live handles 404. Confirm the real handle in Admin.
- `sitemap.xml` returned 500 at crawl time (submit after it is healthy)

---

## 4. Master keyword research (best primary + secondary)

### 4.1 What Indian buyers actually type (from competitor SERPs)

KENT, Aquaguard, RiverSoft and local tank-insert brands rank for these clusters. Scale-O should map **one primary per URL**.

**Highest commercial intent (buy now):**

1. water softener for home
2. best water softener in India
3. water softener price
4. bathroom water softener *(KENT owns this; Scale-O should not make it a primary on the main collection)*
5. water softener for overhead tank
6. salt-free water softener
7. whole house water softener
8. hard water softener
9. water softener for geyser / washing machine
10. best water softener in Bangalore / Delhi / Pune / Hyderabad / Ahmedabad

**Highest problem intent (research then buy):**

1. hard water hair fall
2. hair fall due to hard water
3. hard water skin problems
4. white stains on taps
5. geyser scale / limescale
6. how to test hard water at home
7. salt-free vs salt-based water softener
8. does water softener reduce hair fall
9. water softener vs RO

**Scale-O unique / easier-win terms (Month 1 priority):**

- salt-free water softener
- water softener for overhead tank
- overhead tank water softener
- DIY water softener (no plumber)
- water softener without electricity
- water softener without salt
- chelation water softener *(brand education, low volume)*

Do **not** make *bathroom water softener* the homepage or collection primary. That SERP is dominated by point-of-use KENT/RiverSoft shower units. Scale-O is a **tank-level whole-house** product. Use bathroom/hair-fall terms as **secondary** and in blogs.

### 4.2 Keyword master list

| Keyword | Intent | Est. India MSV | Difficulty | Business value | Map to URL |
|---|---|---|---|---|---|
| water softener | Commercial | Very High | Very High | Brand category | Do not give a thin page this primary |
| water softener for home | Commercial | High | High | Core D2C | `/collections/water-softeners` |
| best water softener in india | Commercial | High | High | Comparison | Homepage secondary; vs-competitors page |
| water softener price | Transactional | High | Medium-High | Plans / PDPs | `/pages/water-softener-plans` |
| hard water | Informational | Very High | High | Demand | Blogs + homepage problem section |
| hard water hair fall | Problem | High | Medium | Strong Scale-O story | Blog 1 + homepage hero secondary |
| hair fall due to hard water | Problem | High | Medium | Same cluster | Blog 1 |
| bathroom water softener | Commercial | High | High | Adjacent, KENT-owned | Secondary only |
| salt-free water softener | Commercial | Medium | Medium | Scale-O USP | Homepage **primary** |
| water softener for overhead tank | Commercial | Low–Med | Low–Med | Unique fit | Collection H2 + Mini/Semi/Centi secondary |
| overhead tank water softener | Commercial | Low–Med | Low–Med | Unique fit | Product H2s |
| whole house water softener | Commercial | Medium | Medium | Current collection title language | Collection secondary |
| hard water softener | Commercial | Medium | Medium | Category | Collection secondary |
| water softener for geyser | Commercial | Low–Med | Low–Med | Appliance protection | Blog 5 + PDP benefits |
| water softener for washing machine | Commercial | Low–Med | Low–Med | Appliance | Blog 5 |
| salt-free vs salt-based water softener | Comparison | Low–Med | Low | High conversion | Blog 2 + vs-competitors |
| how to test hard water at home | HowTo | Medium | Low–Med | AEO | Blog 3 |
| does water softener reduce hair fall | Question | Low–Med | Low | AEO / FAQ | Homepage + PDP FAQ |
| best water softener in bangalore | Local | Medium | Medium | City page | Bangalore page |
| best water softener in delhi | Local | Medium | Medium | City page | Delhi page |
| best water softener in pune | Local | Low–Med | Low–Med | City page | Pune page |
| best water softener in hyderabad | Local | Low–Med | Low–Med | City page | Hyderabad page |
| best water softener in ahmedabad | Local | Low–Med | Low | HQ + city | Ahmedabad page |
| water softener for 500 litre tank | Commercial | Low | Low | Mini | Mini PDP |
| water softener for 1000 litre tank | Commercial | Low | Low | Semi | Semi PDP |
| water softener for 2000 litre tank | Commercial | Low | Low | Centi | Centi PDP |
| scale-o / scale o water softener | Brand | Low | Low | Protect | Homepage + brand mentions |
| kent water softener | Competitor | High | High | Do not rank for this | Comparison page only, honest |

### 4.3 Cannibalization lock (one primary = one URL)

| Primary keyword | Only this URL may own it |
|---|---|
| salt-free water softener | Homepage `/` |
| water softener for home | `/collections/water-softeners` |
| water softener for house | 301 `/collections/water-softener-for-house` → water-softeners (later) |
| water softener price / plans | `/pages/water-softener-plans` |
| salt-free vs salt-based water softener | Blog + `/pages/scale-o-vs-competitors` (page = commercial compare; blog = education) |
| water softener for 500L / small family | Mini PDP |
| water softener for 1000–1500L / 4–6 members | Semi PDP |
| water softener for 2000–2500L / large family | Centi PDP |
| best water softener in [city] | That city page only |

**Redirect later (do not keep competing):**

- `/collections/all` → `/collections/water-softeners`
- `/collections/all-products` → `/collections/water-softeners`
- `/collections/water-softener-for-house` → `/collections/water-softeners` (after copying any unique body)
- `/collections/storage-for-overhead-tanks` → `/collections/water-softeners` or keep only if it gets a unique primary (`water softener for overhead tank`) — recommended: keep this collection **only if** you give it that primary and remove it from the main collection H1. Default Month 1: redirect it, put the keyword on the main collection as secondary.

---

## 5. Page SEO blueprints (before → after)

Copy-paste the **After** title and description into Shopify **Search engine listing**. Then update the listed on-page sections in Theme Editor / page body.

---

### PAGE 1 — Homepage

**URL:** `https://scale-o.com/`

| | Current (before) | After (use this) |
|---|---|---|
| **Title** | `Scale-O` (7 chars) | `Salt-Free Water Softener for Home \| Scale-O` (45) |
| **Description** | `Protect your home from hard water damage with Scale-O Water Softeners. Trusted by 2L+ families across India for safer, cleaner water. Shop now and get Flat INR 500/- off on your first order!` (~190 chars) | `Salt-free water softener for Indian homes. Drop Scale-O in your overhead tank — no salt, no plumber, no electricity. Reduce scale, hair fall and geyser damage.` (159) |

**Current problems**

- Title is brand-only. Cannot rank for any buying keyword.
- Description is a promo + unverified “2L+ families” claim.
- Visible H1s are problem slogans (`Protect your Family from Hair Fall…`) with **no product keyword**.
- Coupon wastes snippet space and goes stale.

**Primary keyword:** salt-free water softener  
**Secondary:** water softener for home; water softener for overhead tank; hard water hair fall; no electricity water softener

**H1 to set (Theme Editor → Hero):**  
`Salt-Free Water Softener for Indian Homes`

**Hero subhead:**  
`Install in your overhead tank. No salt, no plumber, no electricity.`

**Content section updates**

| Section | What to change | Keywords |
|---|---|---|
| Hero H1 | Replace problem-only slides with one keyword H1 on the first slide | Primary |
| Hero body | First 40 words: salt-free + overhead tank + hair fall / scale | Primary + secondary |
| USP strip | Keep 4 USPs: No salt / No electricity / DIY tank install / Whole house | Secondary |
| How It Works | H2: `How a salt-free water softener works in an overhead tank` | Primary + tank |
| Shop by Products | H2 stays; product card titles already keyword-rich — keep | Product secondaries |
| Hard Water Problems | H2: `Hard water hair fall, geyser scale and bathroom stains` | Problem secondaries |
| Solutions | H2: `Scale-O salt-free water softener — tank-level protection` | Primary |
| People & Property | Body: appliances + skin/hair, not chemical jargon | geyser, washing machine |
| FAQ (add if missing) | See questions below | Question keywords |
| Image ALT | `Scale-O salt-free water softener in overhead tank` | Primary |

**FAQs to add on homepage (AEO)**

1. What is a salt-free water softener?
2. Does a water softener reduce hair fall from hard water?
3. Can I install a water softener in an overhead tank without a plumber?
4. Is Scale-O better than a salt-based water softener for Indian homes?

**Shopify path:** Online Store → Themes → Customize → Homepage sections for H1/H2. Homepage **SEO title/description**: Online Store → Preferences → **Homepage title and meta description** (Shopify store-level homepage SEO), **or** theme SEO fields if the theme exposes them. If Preferences already holds `Scale-O`, replace it there.

**Internal links out:** Collection, Mini, Semi, Centi, Plans, salt-free vs salt-based blog.

---

### PAGE 2 — Main collection (shop)

**URL:** `https://scale-o.com/collections/water-softeners`

| | Current (before) | After (use this) |
|---|---|---|
| **Title** | `Shop Whole House Water Softeners \| Hard Water Softener` (53) | `Water Softener for Home \| Salt-Free Tank Insert \| Scale-O` (57) |
| **Description** | `Shop Scale-O's full range of salt-free hard water softeners for 500L to 5,000L tanks. Whole house softener systems for homes & bungalow with overhead tanks. Buy now!` (~170 chars, grammar error “bungalow”) | `Buy a water softener for home. Scale-O salt-free units sit in 500L–2500L overhead tanks. No salt, no electricity. Choose Mini, Semi or Centi by family size.` (157) |

**Current problems**

- Title leads with “Shop” (low ranking value) and “whole house” (US/KENT plumbing language).
- Description is slightly long, has a grammar error, and does not use the highest-intent phrase *water softener for home*.
- On-page H1 in the template is `Best Water Softener for Whole House`, but the first `<h1>` Google can see is later: `Before vs After Using Scale-O`. That is a serious on-page error.
- Duplicate collections (`/all`, `/all-products`, `/water-softener-for-house`) steal the same intent.

**Primary keyword:** water softener for home  
**Secondary:** salt-free water softener; water softener for overhead tank; hard water softener; whole house water softener

**H1 (only one H1 on the page):**  
`Water Softener for Home — Salt-Free for Overhead Tanks`

Change the before/after block heading to **H2**: `Before vs after a salt-free water softener`

**Content section updates**

| Section | What to change | Keywords |
|---|---|---|
| Collection SEO title/desc | Paste After strings in Admin | Primary |
| Collection description (top) | First 80 words must include *water softener for home* + overhead tank | Primary + tank |
| H2 Why homeowners choose | Keep bullets; add “for independent houses, not apartments” | Qualifier |
| H2 Hard water problems | Keep; add hair fall + geyser | Problem |
| How it works H2 | `How to install a water softener in an overhead tank` | Tank |
| Size chooser | Keep Mini/Semi/Centi tables; they already match capacity keywords | Capacity |
| FAQ | Keep existing; add *water softener for home vs bathroom softener* | Disambiguate vs KENT |

**Shopify path:** Products → Collections → Water Softeners → Search engine listing + collection description.

---

### PAGE 3 — Duplicate collections (fix, do not optimize separately)

| URL | Current title | Current description | Problem | Month 1 action |
|---|---|---|---|---|
| `/collections/all` | `Products` | none | Generic; competes with main shop | 301 → `/collections/water-softeners` |
| `/collections/all-products` | `All Products` | (homepage-like body) | Duplicate of main collection | 301 → water-softeners |
| `/collections/water-softener-for-house` | `Water softener for house` | none | Near-duplicate of “for home”; no meta | 301 after merging unique copy |
| `/collections/storage-for-overhead-tanks` | `Storage For Overhead Tanks` | none | Title is not a search query | 301 or retarget only if you isolate *water softener for overhead tank* here |
| `/collections/salt-free-water-softeners` | 404 | — | Footer/quick link may 404 | Point menu to homepage or main collection |
| `/collections/soft-water-conditioners` | 404 | — | Broken footer link | Fix menu |

---

### PAGE 4 — Scale-O Mini (Priority A product)

**URL:** `https://scale-o.com/products/mini-water-softener-500l-750l-tanks`  
**Duplicate (canonical already correct):** `/products/scale-o-mini`

| | Current (before) | After (use this) |
|---|---|---|
| **Title** | `Scale-O Mini Salt-Free Water Softener for 500L-750L Storage Tanks` (65) | `Water Softener for 500L Tank \| Scale-O Mini` (44) |
| **Description** | `Scale-O Mini is a saltless water softener for 500L overhead tanks, ideal for homes up to 3 members. Easy install, no maintenance. Buy at INR 3,500/- only!` (154) | `Salt-free water softener for 500L–750L overhead tanks. Scale-O Mini suits 1–3 member homes. No salt, no plumber, no electricity. Trial from ₹3,500.` (148) |

**Current problems**

- Title starts with brand + model; searchers type *water softener for 500 litre tank* / *small family*.
- 65 characters — likely truncated.
- Price in description dates badly if plans change.
- “saltless” is less searched than “salt-free”.

**Primary:** water softener for 500 litre tank  
**Secondary:** salt-free water softener for small family; overhead tank water softener; water softener for 1 bhk / up to 3 members

**H1:** `Scale-O Mini — Salt-Free Water Softener for 500L–750L Tanks`

**Content section updates**

| Section | Change | Keywords |
|---|---|---|
| Product title (H1) | Keep capacity in the title | Primary |
| First product body paragraph | “Best water softener for small homes with a 500L overhead tank” | Primary |
| USP chips | No salt / no electricity / DIY | Secondary |
| Specs / Additional information | Tank size, daily 500 L, family 1–3 | Capacity |
| How it works | Mention Mini is dropped in the tank | Tank |
| FAQ | “Is Mini enough for a 500 litre tank?” | Primary as question |
| Image ALT | `Scale-O Mini salt-free water softener for 500L overhead tank` | Primary |

**Shopify path:** Products → Scale-O Mini → Search engine listing.

---

### PAGE 5 — Scale-O Semi (Priority A product)

**URL:** `https://scale-o.com/products/semi-water-softener-1000l-1500l-tanks`  
**Duplicate:** `/products/scale-o-semi` (canonical OK)

| | Current (before) | After (use this) |
|---|---|---|
| **Title** | `Scale-O Semi Salt-Free Water Softener \| 1000L-1500L Storage Tanks` (65) | `Water Softener for 1000L–1500L Tank \| Scale-O Semi` (51) |
| **Description** | `Scale-O Semi is a salt-free hard water softener for 1000-1500L tanks, built for 4-6 member homes. No salt, no maintenance. Easy install. Shop now!` (146) | `Salt-free water softener for 1000L–1500L overhead tanks. Scale-O Semi is for 4–6 member homes. No salt, no electricity, DIY tank install. Shop Semi.` (148) |

**Current problems:** Brand-first title, slightly long, misses *4–6 members* in the title (high-intent family filter).

**Primary:** water softener for 1000 litre tank  
**Secondary:** water softener for 4–6 members; salt-free hard water softener; overhead tank 1500L

**H1:** keep capacity; ensure it is the only H1.

**Sections:** same pattern as Mini (intro, specs, FAQ, ALT) with 1000–1500L / 4–6 members / 1500 L per day.

---

### PAGE 6 — Scale-O Centi (Priority A product)

**URL:** `https://scale-o.com/products/centi-water-softener-2000l-2500l-tanks`  
**Duplicate:** `/products/scale-o-centi` (canonical OK)

| | Current (before) | After (use this) |
|---|---|---|
| **Title** | `Scale-O Centi Salt-Free Water Softener \| 2000L-2500L Storage Tanks` (66) | `Water Softener for 2000L Tank \| Scale-O Centi` (46) |
| **Description** | `Scale-O Centi is a salt-free water softener for 2000-2500L overhead tanks, perfect for bungalows & 7-10 member homes. Easy install, no maintenance required.` (156) | `Salt-free water softener for 2000L–2500L tanks. Scale-O Centi suits large families and bungalows (7–10 members). No salt, no plumber, no electricity.` (148) |

**Primary:** water softener for 2000 litre tank  
**Secondary:** water softener for bungalow; large family water softener; 2500L overhead tank

**H1:** `Scale-O Centi — Salt-Free Water Softener for 2000L–2500L Tanks`

**Sections:** same product pattern; add bungalow / villa in intro paragraph.

---

### PAGE 7–9 — Combo products

**Mini combo** `/products/mini-combo-water-softener-2x500l-tanks`

| | Before | After |
|---|---|---|
| Title | `Scale-O Mini+Mini Combo Water Softener \| 2x 500L Storage Tanks` (62) | `Water Softener for Two 500L Tanks \| Mini Combo` (47) |
| Description | 170 chars, says “larger homes” (vague) | `Salt-free combo for two 500L overhead tanks. Scale-O Mini+Mini covers dual-tank homes. No salt, no electricity. Shop the 2-tank set.` (132) |

**Primary:** water softener for two overhead tanks  
**Secondary:** dual tank water softener; Mini combo

**Semi combo** `/products/semi-combo-water-softener-2x1500l-tanks`

| | Before | After |
|---|---|---|
| Title | `Scale-O Semi+Semi Combo Water Softener \| 2x 1500L Storage Tanks` (63) | `Water Softener for Two 1500L Tanks \| Semi Combo` (48) |
| Description | 148 chars, “Best salt-free…” (superlative without proof) | `Salt-free Semi combo for two 1000L–1500L tanks. Built for bungalows with dual overhead tanks. No plumber, no electricity.` (122) |

**Centi combo** `/products/centi-combo-water-softener-2x2500l-tanks`

| | Before | After |
|---|---|---|
| Title | `Scale-O Centi+Centi Combo Water Softener \| 2 x 2500L Tanks` (58) | `Water Softener for Two 2500L Tanks \| Centi Combo` (49) |
| Description | 172 chars, truncated | `Salt-free Centi combo for two 2000L–2500L tanks. For large bungalows and 11–15 member homes. No salt, no electricity. Shop the dual-tank set.` (141) |

**Current combo problems:** titles are brand-heavy; descriptions too long; “best” claims; overlapping family-size copy vs single units.

---

### PAGE 10–13 — Nano / Ultra / Mega / Giga (light commercial)

These are not Month-1 ranking priorities. Fix metas so they stop looking like internal SKUs.

| URL | Before title | Before description | After title | After description | Primary |
|---|---|---|---|---|---|
| `/products/scale-o-nano-water-softeners` | `Nano Water Softener` | `For Trials Only \|\| Micro Size` | `Scale-O Nano Trial Water Softener` | `Scale-O Nano is a micro trial unit, not a full-home water softener. Use only if our team assigned this SKU.` | scale-o nano (brand protect) |
| `/products/scale-o-ultra` | `Ultra Water Softener` | spec dump | `Water Softener for 5000L Tank \| Scale-O Ultra` | `Salt-free water softener for 5000L storage and ~5000 L/day use. For large homes and light commercial tanks.` | water softener for 5000 litre tank |
| `/products/scale-o-mega` | `Mega Water Softener` | spec dump | `Water Softener for 10,000L Tank \| Scale-O Mega` | `Salt-free water softener for 10,000L tanks and high daily use. For large properties. No salt, no electricity.` | water softener for 10000 litre tank |
| `/products/scale-o-giga` | `Giga Water Softener` | spec dump | `Water Softener for 20,000L Tank \| Scale-O Giga` | `Salt-free water softener for 20,000L tanks. For very large storage. Contact Scale-O for the right plan.` | water softener for 20000 litre tank |

If Nano is trials-only, **unpublish** it from the catalog collection so it does not dilute “water softener for home”.

---

### PAGE 14 — Water Softener Plans

**URL:** `https://scale-o.com/pages/water-softener-plans`

| | Before | After |
|---|---|---|
| Title | `water softener plans` (20, lowercase) | `Water Softener Price & Plans in India \| Scale-O` (48) |
| Description | none | `Scale-O water softener price by plan: 6-month trial, 1, 2 and 3 year. Compare Mini, Semi and Centi for your tank size. Salt-free, no electricity.` (147) |

**Current problems:** unedited title; no description; Google may snippet random plan tables.

**Primary:** water softener price  
**Secondary:** water softener plans India; Mini Semi Centi price; 3 year water softener plan

**H1:** `Water Softener Price and Plans`

**Sections:** intro paragraph with *water softener price in India*; comparison table already on page — add a line of keyword text above each Mini/Semi/Centi block; FAQ: “What is the water softener price for a 4–6 member home?”

---

### PAGE 15 — Scale-O vs Competitors

**URL:** `https://scale-o.com/pages/scale-o-vs-competitors`

| | Before | After |
|---|---|---|
| Title | `Scale-o VS Competitors` (22) | `Salt-Free vs Salt-Based Water Softener \| Scale-O` (49) |
| Description | none | `Compare salt-free vs salt-based water softeners for Indian homes. Scale-O needs no salt, plumber or electricity. See how it differs from tank plants.` (149) |

**Current problems:** branded, informal title; no meta; “VS Competitors” is not a query.

**Primary:** salt-free vs salt-based water softener *(commercial compare)*  
**Secondary:** water softener comparison India; Scale-O vs traditional softener; no salt water softener

Keep the long-form comparison. Add H2s: `Salt-free vs salt-based water softener`, `Water softener vs bathroom shower filter`, `Water softener vs RO`. Do not attack KENT by name in the title.

---

### PAGE 16 — About Us

**URL:** `https://scale-o.com/pages/about-us`

| | Before | After |
|---|---|---|
| Title | `About Us` | `About Scale-O \| Salt-Free Water Softener Brand` (47) |
| Description | none | `Scale-O makes salt-free water softeners for Indian overhead tanks. Made in Ahmedabad. GOI Book of Innovations. Learn who we are and how chelation works.` (152) |

**Primary:** Scale-O (brand)  
**Secondary:** salt-free water softener brand India; made in Ahmedabad

**H1:** `About Scale-O`  
First paragraph: brand + salt-free + overhead tank + Ahmedabad HQ.

---

### PAGE 17 — Customers / Testimonials

**URL:** `https://scale-o.com/pages/customers`

| | Before | After |
|---|---|---|
| Title | `Customers` | `Scale-O Reviews \| Salt-Free Water Softener India` (49) |
| Description | none | `Read Scale-O customer reviews for salt-free water softeners. Homeowners share results on scale, hair and easy overhead-tank install.` (133) |

**Primary:** Scale-O reviews  
**Secondary:** salt-free water softener reviews India

---

### PAGE 18 — Consult Now

**URL:** `https://scale-o.com/pages/consult-now`

| | Before | After |
|---|---|---|
| Title | `Consult Now` | `Book a Water Softener Consultation \| Scale-O` (45) |
| Description | none | `Not sure Mini, Semi or Centi? Book a free Scale-O consult. We size a salt-free water softener for your overhead tank and family.` (128) |

**Primary:** water softener consultation  
**Secondary:** which water softener for my tank

---

### PAGE 19 — Book Trial

**URL:** `https://scale-o.com/pages/book-trial`

| | Before | After |
|---|---|---|
| Title | `Book Trial` | `Water Softener Trial Plan \| Scale-O 6 Months` (45) |
| Description | Homepage promo reused (190 chars) | `Try Scale-O for 6 months. Salt-free water softener trial for your overhead tank. No plumber, no electricity. Start with Mini, Semi or Centi.` (141) |

**Problem:** inherits homepage coupon description.

**Primary:** water softener trial  
**Secondary:** 6 month water softener plan

---

### PAGE 20 — Societies / dirty URL

**URL:** `https://scale-o.com/pages/copy-of-shop-by-purpose-r2`

| | Before | After |
|---|---|---|
| Title | `Shop by Purpose R2` | `Water Softener for Societies & Apartments \| Scale-O` (52) |
| Description | none | `Scale-O for residential societies and apartment tanks. Salt-free, no plant room. Tell us tank size and daily use for the right setup.` (134) |

**Current problems:** Google-unfriendly handle `copy-of-shop-by-purpose-r2`; title is an internal duplicate name.

**Month 1 actions (Admin, no code):**

1. Create a new page handle: `/pages/water-softener-for-societies` (or rename handle if Shopify allows)
2. Add URL redirect: `copy-of-shop-by-purpose-r2` → new handle  
   Admin → Online Store → Navigation → **URL redirects**
3. Use After title/description above

**Primary:** water softener for society  
**Secondary:** water softener for apartment tank; residential complex water softener  
Note: homepage FAQ currently says Scale-O is **not** for apartments. Align product truth with this page. If societies are in-scope, change the collection FAQ. If not, noindex this page.

---

### PAGE 21 — Ahmedabad city

**URL:** `https://scale-o.com/pages/best-water-softener-in-ahmedabad`

| | Before | After |
|---|---|---|
| Title | `Best Water Softener in Ahmedabad` (32) | `Best Water Softener in Ahmedabad \| Salt-Free \| Scale-O` (55) |
| Description | `Buy Scale-O water softener in Ahmedabad. Salt-free, DIY install, no plumber needed. Ahmedabad's hard water problems solved easily. Free shipping.` (145) | `Best salt-free water softener in Ahmedabad for overhead tanks. No salt, no plumber, no electricity. Built for Gujarat hard water. Shop Mini, Semi, Centi.` (155) |

**Current problems:** title is OK but generic “best”; description is decent, can add tank + Gujarat hardness.

**Primary:** best water softener in Ahmedabad  
**Secondary:** water softener in Ahmedabad; Gujarat hard water; Scale-O Ahmedabad (HQ)

**H1:** `Best Water Softener in Ahmedabad for Overhead Tanks`  
Add unique local bits: Sabarmati / borewell / tanker mix, HQ address NAP, price table, 4 local FAQs.

---

### PAGE 22 — Delhi city

**URL:** `https://scale-o.com/pages/best-water-softener-delhi`  
(Also test `/pages/best-water-softener-in-delhi` — 404 at crawl time. Keep one canonical.)

| | Before | After |
|---|---|---|
| Title | `Find The Best Water Softener in Delhi for Overhead Tanks` (56) | `Best Water Softener in Delhi \| Overhead Tank \| Scale-O` (55) |
| Description | 160 chars, already decent | `Best water softener in Delhi for overhead tanks. Scale-O is salt-free — no plumber, no electricity. Built for Delhi-NCR hard water, geysers and hair fall.` (155) |

**Current problems:** “Find The” wastes title characters; description is OK.

**Primary:** best water softener in Delhi  
**Secondary:** water softener in Delhi NCR; Delhi hard water; geyser scale Delhi

---

### PAGE 23 — Hyderabad city

**URL:** `https://scale-o.com/pages/best-water-softener-in-hyderabad`

| | Before | After |
|---|---|---|
| Title | `Best Water Softener in Hyderabad for Home &amp; Overhead Tanks` (62 + HTML entity) | `Best Water Softener in Hyderabad \| Scale-O` (43) |
| Description | 200 chars (too long) | `Best water softener in Hyderabad for borewell and tank water. Scale-O salt-free insert: no salt, no plumber, no electricity. For Gachibowli, Kukatpally and more.` (160) |

**Current problems:** `&amp;` in title; description over 160.

**Primary:** best water softener in Hyderabad  
**Secondary:** water softener in Hyderabad; Hyderabad borewell water; hard water Kukatpally

---

### PAGE 24 — Pune city

**URL:** `https://scale-o.com/pages/best-water-softener-in-pune`

| | Before | After |
|---|---|---|
| Title | `Find The Best Water Softener for Home in Pune \| Scale-O` (55) | `Best Water Softener in Pune \| Salt-Free \| Scale-O` (50) |
| Description | 161 chars | `Best water softener in Pune for overhead tanks. Scale-O is salt-free and DIY. Reduce scale from Pune hard / borewell water. Choose Mini, Semi or Centi.` (152) |

**Primary:** best water softener in Pune  
**Secondary:** water softener in Pune; Pune borewell; hard water Pune

---

### PAGE 25 — Bangalore city

Theme template exists (`page.best-water-softener-blr.json`). Live handles tested 18 Aug 2026 returned **404** (`/pages/best-water-softener-blr`, `/pages/best-water-softener-in-bangalore`).

**Action:** In Admin → Pages, find the Bangalore page, note the real handle, publish it, then set:

| Field | Use this |
|---|---|
| Title | `Best Water Softener in Bangalore \| Scale-O` (43) |
| Description | `Best water softener in Bangalore for borewell and tank water. Scale-O salt-free insert fights Whitefield-style hardness, hair fall and geyser scale.` (149) |
| Primary | best water softener in Bangalore |
| Secondary | water softener in Bangalore; Bangalore borewell; hard water hair fall Bangalore |
| H1 | `Best Water Softener in Bangalore for Overhead Tanks` |

If the page is unpublished, **publish it**. Bangalore is the highest-intent city cluster after generic India terms.

---

### PAGE 26 — Blog index

**URL:** `https://scale-o.com/blogs/articles` (`/blogs/news` also resolves)

| | Before | After |
|---|---|---|
| Title | `Scale-O Blogs` | `Hard Water & Water Softener Guides \| Scale-O Blog` (50) |
| Description | Homepage promo reused (190) | `Guides on hard water hair fall, salt-free vs salt-based softeners, tank installation and appliance scale. Written for Indian homes.` (132) |

**Primary:** hard water guides (cluster hub)  
**Secondary:** water softener blog India

Shopify: Online Store → Blog posts is for articles; the **blog** SEO is under Online Store → Blog posts → **Manage blogs** (or Blog settings) depending on admin version. Set title/description for the `articles` blog.

---

### PAGE 27–32 — Existing blog posts (optimize, do not retarget as products)

Keep each post’s primary **informational**. Link to Mini/Semi/Centi.

| Post | Current title pattern | After meta title | Primary | Secondary |
|---|---|---|---|---|
| 7 Major Signs Your House May Experience Hard Water Issues | Long, generic | `7 Signs of Hard Water at Home \| Scale-O` | signs of hard water | white stains on taps |
| 7 Major Benefits of Using a Water Softener | Generic list | `Benefits of a Water Softener for Home \| Scale-O` | benefits of water softener | soft water benefits |
| Water Technologies & Options Available in the Market | Vague | `Water Softener Types in India \| Salt-Free vs Salt` | types of water softener | TAC, ion exchange |
| Hard Water Myths vs. Reality | OK | `Hard Water Myths vs Facts \| India Guide` | hard water myths | does hard water cause hair fall |
| How Hard Water Damages Your Home… | Too long | `How Hard Water Damages Pipes & Geysers` | hard water damage | limescale in pipes |
| Salt-Free vs Salt-Based… | Brand-heavy | `Salt-Free vs Salt-Based Water Softener India` | salt-free vs salt-based water softener | *(align with compare page; blog = education)* |
| How Chelation Technology… | Brand education | `What Is Chelation Water Softening? \| Scale-O` | chelation water softener | how Scale-O works |
| Difference Between Scaling, TDS and Hardness | Good topic | `Scaling vs TDS vs Hardness \| Softener vs RO` | hardness vs TDS | water softener vs RO |
| Hard Water in India Throughout the Years | Weak query | `Hard Water in India: Why Homes Need Softeners` | hard water in India | groundwater hardness |
| How Hard Water Reduces Lifespan of Appliances | Close to new Blog 5 | `Hard Water and Home Appliances \| Geyser & WM` | hard water appliances | geyser scale |
| How Salt-Free Water Softeners Support Sustainable Living | Soft | `Salt-Free Water Softener: No Water Waste` | salt-free water softener eco | no regeneration waste |
| Can Installing a Water Softener Lower Utility Bills? | Good | `Does a Water Softener Lower Utility Bills?` | water softener electricity bill | geyser efficiency |

**Meta description pattern for every blog (145–160 chars):**  
`Answer in 20 words. Who it is for (Indian home / overhead tank). CTA: see Mini/Semi/Centi.`

Do not put coupons in blog metas.

---

### PAGE 33+ — Partner / policy (light)

Many partner URLs 404. Policies that load inherit the **homepage promo description**. That is the problem to fix.

| URL | Before title | Before description | After title | After description |
|---|---|---|---|---|
| `/pages/privacy-policy` | Privacy Policy | none or homepage | Privacy Policy \| Scale-O | How Scale-O collects and uses customer data for orders and support. |
| `/pages/shipping-policy` | Shipping Policy | none | Shipping Policy \| Scale-O | Scale-O shipping, delivery timelines and coverage for water softener orders in India. |
| `/pages/terms-and-conditions` | Terms and Conditions | none | Terms and Conditions \| Scale-O | Terms for buying Scale-O salt-free water softeners and subscription plans. |
| `/pages/exchange-policy` | Exchange Policy | homepage promo | Exchange Policy \| Scale-O | Cartridge exchange, guarantee and replacement rules for Scale-O plans. |
| `/pages/legal-policy` | Legal Policy | homepage promo | Legal Policy \| Scale-O | Legal notices for Scale-O.com and Scale-O products. |
| `/pages/become-a-retailer` | Become a Retailer | homepage promo | Become a Scale-O Retailer | Partner with Scale-O to retail salt-free water softeners. Apply here. |
| `/pages/collaborate-as-brand` | Collaborate as Brand | homepage promo | Collaborate with Scale-O | Brand collaboration with Scale-O salt-free water softeners. |

**404 at crawl time (fix in Admin if they should exist):**  
`/pages/contact`, `/pages/faqs`, `/pages/industrial`, `/pages/commercial`, `/pages/institutional`, `/pages/agricultural`, `/pages/partners`, `/pages/refund-policy`, `/pages/shop-by-purpose`.

If D2C residential is the only focus, **do not rebuild industrial/agricultural pages in Month 1**. Remove them from menus. Add redirects to homepage or consult page.

If Contact is 404, create `/pages/contact-us` with:

- Title: `Contact Scale-O \| Water Softener Support`
- Description: `Contact Scale-O in Ahmedabad for salt-free water softener orders, plans and support. Phone, email and HQ address.`
- Primary: Scale-O contact

---

## 6. Product content template (use on every PDP)

Apply this in Theme Editor on the default product template. Same structure, swap capacity words.

| Block | Write this pattern |
|---|---|
| H1 | `[Model] — Salt-Free Water Softener for [tank] Tanks` |
| Opening 60 words | `[Model] is a salt-free water softener for [tank] overhead tanks, for [family] homes using about [daily] per day.` |
| H2 | `Why this water softener for [tank] tanks` |
| H2 | `How to install Scale-O in an overhead tank` |
| H2 | `Specs` (keep KV table) |
| H2 | `Water softener plans and price` |
| H2 FAQ | `Does [model] reduce hard water scale / hair fall?` |
| ALT | `[Model] salt-free water softener for [tank] overhead tank` |
| CTA | `Shop [Model]` / `Book a consult` |

Do **not** hide keyword content behind scroll-only animation. If a section is not visible, Google still can read it, but users and some AI crawlers will not.

---

## 7. Six Month-1 blogs (new)

Write these as new posts. Do not cannibalize the existing salt-free vs salt-based article — **update that existing URL** instead of creating a second one for Blog 2.

### Blog 1 — Hair breakage diagnostic (new)

- **Slug:** `/blogs/articles/hard-water-hair-breakage-vs-shedding`
- **Primary:** hard water hair fall  
- **Secondary:** hair fall due to hard water; does water softener reduce hair fall  
- **Title:** `Hard Water Hair Fall: Breakage vs Shedding Checklist` (52)  
- **Description:** `Is your hair falling from hard water or from shedding? Use this 2-minute checklist, then see how a salt-free tank softener helps.` (129)  
- **H2s:** Breakage vs shedding; 2-minute test; borewell vs municipal; what a tank softener can and cannot do; FAQ  
- **Links:** Mini/Semi/Centi, collection, Bangalore city page  

### Blog 2 — Salt-free vs salt-based (optimize existing)

- **Existing URL:** `/blogs/articles/salt-free-vs-salt-based-water-softeners`
- **Primary:** salt-free vs salt-based water softener  
- **Title:** `Salt-Free vs Salt-Based Water Softener India 2026` (49)  
- **Description:** `Salt-free vs salt-based water softeners for Indian homes: cost, salt, waste, tank install. When Scale-O fits better than a plant.` (129)  
- **Note:** Compare page stays commercial; this post stays educational. Cross-link both.

### Blog 3 — Boiling test (new)

- **Slug:** `/blogs/articles/how-to-test-hard-water-at-home`
- **Primary:** how to test hard water at home  
- **Secondary:** hard water test boiling; TDS vs hardness  
- **Title:** `How to Test Hard Water at Home (5-Minute Boil Test)` (51)  
- **Description:** `Test hard water at home with a kettle boil test. Learn hardness vs TDS, then choose a salt-free overhead tank softener.` (120)  
- **Schema later:** HowTo + FAQ  

### Blog 4 — Overhead tank buyer guide (new)

- **Slug:** `/blogs/articles/best-overhead-tank-water-softener-india`
- **Primary:** water softener for overhead tank  
- **Secondary:** overhead tank water softener; Mini vs Semi vs Centi  
- **Title:** `Best Overhead Tank Water Softener for Indian Homes` (50)  
- **Description:** `Choose a water softener for your overhead tank by litres and family size. Scale-O Mini, Semi and Centi buyer guide.` (115)  

### Blog 5 — Geyser and washing machine (new; tighten existing appliance post)

- **Slug:** `/blogs/articles/hard-water-geyser-washing-machine-damage`  
  If too close to the existing appliance article, **merge** into that URL instead.
- **Primary:** hard water damage to geyser  
- **Secondary:** water softener for geyser; washing machine hard water  
- **Title:** `Hard Water Damage to Geysers and Washing Machines` (49)  
- **Description:** `How hard water scales geysers and washing machines, what it costs, and how a tank-level salt-free softener helps.` (112)  

### Blog 6 — Bangalore borewell (new; supports city page)

- **Slug:** `/blogs/articles/bangalore-borewell-water-hair-fall`
- **Primary:** Bangalore borewell hair fall  
- **Secondary:** best water softener in Bangalore; Whitefield hard water  
- **Title:** `Bangalore Borewell Water and Hair Fall \| Scale-O` (49)  
- **Description:** `Why Bangalore borewell water causes hair fall and scale. What a salt-free overhead tank softener can do in Whitefield and beyond.` (128)  

---

## 8. Shopify Admin — how to apply (no code)

### 8.1 Homepage title and description

1. Shopify Admin → **Online Store** → **Preferences**
2. **Title and meta description**
3. Paste Homepage After title and description
4. Save
5. View `https://scale-o.com` source and confirm `<title>` and `<meta name="description">`

### 8.2 Product / collection / page / article

1. Open the resource
2. Scroll to **Search engine listing** → **Edit**
3. Paste the After title (50–60) and description (145–160)
4. Edit **URL handle** only if you also add a **URL redirect** from the old handle
5. Save
6. Open the live URL in an incognito window

### 8.3 H1 and section copy

1. Online Store → Themes → **Customize**
2. Open the template (Home, Collection, Product, Page)
3. Edit Hero / Rich text / FAQ headings
4. Save

You cannot add a “Primary keyword” field. Put the keyword in the H1 and first paragraph.

### 8.4 Redirects

Admin → Online Store → Navigation → **URL redirects** → Create redirect.

Priority redirects:

| From | To |
|---|---|
| `/collections/all` | `/collections/water-softeners` |
| `/collections/all-products` | `/collections/water-softeners` |
| `/products/scale-o-mini` | `/products/mini-water-softener-500l-750l-tanks` (if not already 301; canonical exists) |
| `/pages/copy-of-shop-by-purpose-r2` | `/pages/water-softener-for-societies` (after rename) |

### 8.5 What theme code already does

`snippets/SEO.liquid` prints Shopify’s `page_title` and `page_description`. If you fill Admin SEO fields, the theme will output them. **Do not edit this file for this project.**

---

## 9. AEO / FAQ foundation (Month 1)

Add answer-first FAQs (40–60 word answers) on: Homepage, main collection, Mini, Semi, Centi, 5 city pages.

Highest-volume question keywords:

1. Does water softener reduce hair fall?
2. What is a salt-free water softener?
3. Water softener vs RO — do I need both?
4. Can I install a water softener in an overhead tank?
5. Salt-free vs salt-based — which is better for Indian homes?
6. Does Scale-O need electricity or salt?
7. Which Scale-O for a 4–6 member family?
8. Is Scale-O for apartments?

FAQ schema can wait for a later code sprint. Getting the **visible FAQ copy** live is the Month 1 ranking win.

---

## 10. Priority order (what to paste first)

**P0 — this week**

1. Homepage title + description  
2. Collection `/collections/water-softeners` title + description + single H1 fix  
3. Mini, Semi, Centi titles + descriptions  
4. Stop homepage promo leaking onto policies and blog index  
5. Redirect duplicate collections  

**P1 — week 2**

6. Plans, vs-competitors, About, Consult, Trial  
7. Five city pages (publish Bangalore)  
8. Combo + Ultra/Mega/Giga metas  
9. Dirty societies URL rename + 301  

**P2 — week 3–4**

10. Blog index + 12 existing posts  
11. 6 Month-1 content briefs (write/publish)  
12. Partner 404 cleanup / noindex  

---

## 11. Tracking after you publish metas

1. Google Search Console → URL Inspection → Request indexing on P0 URLs  
2. Submit `https://scale-o.com/sitemap.xml` when it stops returning 500  
3. Track queries: *salt-free water softener*, *water softener for home*, *water softener for overhead tank*, five city “best water softener in …”  
4. Watch CTR: if impressions rise but CTR stays low, rewrite the snippet, not the whole page  

---

## 12. Claims and compliance

Do not put in titles or descriptions unless Scale-O can prove them:

- “Trusted by 2L+ families”
- “Best water softener in India” as a global claim (city “best … in [city]” is standard local SEO; keep it, support with unique local content)
- Medical hair-growth claims
- “Removes hardness” if the product **conditions / chelates** rather than ion-exchanges. Prefer: *helps reduce scale*, *salt-free water softener*, *conditions hard water minerals*

---

## 13. Month 1 deliverable checklist

- [ ] All P0 metas pasted in Shopify Admin  
- [ ] One primary keyword per Priority A URL (this document)  
- [ ] Secondary keywords placed in H2 / FAQ / first paragraph — not in a meta keywords tag  
- [ ] Duplicate collections redirected  
- [ ] Policies no longer use homepage coupon description  
- [ ] Bangalore page live with unique meta  
- [ ] 6 blog briefs assigned (this document, section 7)  
- [ ] No theme code changed  

This file is the working spec. Paste the **After** columns; then edit the listed sections. Rankings follow the live content, not this Markdown file.
