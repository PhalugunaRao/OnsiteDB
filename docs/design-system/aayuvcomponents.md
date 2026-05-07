# Aayuv DS — Component-Level Specification

> **Single source of truth for UI generation.**
> Strictly enforces visual, structural, and behavioral consistency.
> Every token, class, and rule below must be followed exactly for 1:1 fidelity with the reference HTML.

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Typography System](#2-typography-system)
3. [Global Reset & Base](#3-global-reset--base)
4. [Layout Shell](#4-layout-shell)
5. [Badges & Tags](#5-badges--tags)
6. [Buttons & Actions](#6-buttons--actions)
7. [Cards & Containers](#7-cards--containers)
8. [Forms & Inputs](#8-forms--inputs)
9. [Advanced Forms](#9-advanced-forms)
10. [Tables](#10-tables)
11. [List Cells](#11-list-cells)
12. [Icon Grids](#12-icon-grids)
13. [Toggle / Switch](#13-toggle--switch)
14. [Card Variants](#14-card-variants)
15. [Navigation Components](#15-navigation-components)
16. [Modals & Panels](#16-modals--panels)
17. [Avatars](#17-avatars)
18. [Health Profiles](#18-health-profiles)
19. [Skeleton Loaders](#19-skeleton-loaders)
20. [Empty States](#20-empty-states)
21. [Stepper Progress](#21-stepper-progress)
22. [Data Visualization](#22-data-visualization)
23. [Editorial Patterns](#23-editorial-patterns)
24. [Biomarker UI Patterns](#24-biomarker-ui-patterns)
25. [Insight Cards](#25-insight-cards)
26. [Motion & Animation](#26-motion--animation)
27. [Icon Library](#27-icon-library)
28. [Voice & Tone](#28-voice--tone)
29. [Accessibility Standards](#29-accessibility-standards)

---

## 1. Design Tokens

All visual decisions map to CSS custom properties on `:root`. These are the **contract between design and engineering**.

### 1.1 Color — Brand

| Token | Value | Usage |
|---|---|---|
| `--brand` | `#2563EB` | Primary brand, section labels, kickers, active nav, CTA, headline emphasis |
| `--brand-dk` | `#1D4ED8` | Brand hover/dark variant |
| `--brand-lt` | `#EFF6FF` | Brand light background tint |
| `--brand-m` | `rgba(37,99,235,0.1)` | Brand muted overlay |
| `--brand-secondary` | `#1B4965` | Secondary brand (editorial deep blue) |
| `--brand-accent` | `#7C3AED` | Accent (purple, used in gradients) |
| `--brand-accent-light` | `#F2EBFD` | Accent light tint |

### 1.2 Color — Neutrals (Surface & Ink)

| Token | Value | Semantic Name | Usage |
|---|---|---|---|
| `--n-0` | `#FFFFFF` | Paper | Primary background, card bg |
| `--n-50` | `#F9FAFB` | Paper 2 | Body bg, tinted cards, table headers |
| `--n-100` | `#F3F4F6` | Paper 3 | Skeleton base, hover bg, subtle fills |
| `--n-200` | `#E5E7EB` | Paper 4 / Rule | Borders, dividers, toggle off bg |
| `--n-300` | `#D1D5DB` | — | Disabled primary bg, muted elements |
| `--n-400` | `#9CA3AF` | — | Disabled text, placeholder, flat trend |
| `--n-500` | `#6B7280` | Ink 4 | Captions, meta text, timestamps |
| `--n-600` | `#4B5563` | Ink 3 | Secondary body text, descriptions |
| `--n-700` | `#2D333D` | — | Tertiary headings, icon default |
| `--n-800` | `#1C2026` | Ink 2 | Primary body text |
| `--n-900` | `#0F1115` | Ink | Headlines, primary text, button bg |

### 1.3 Color — Semantic Health

Each colour has 4 variants: base, dark (`-dk`), light (`-lt`), muted (`-m`).

| Colour | Base | Dark | Light | Muted | Clinical Meaning |
|---|---|---|---|---|---|
| **Rose** | `#E8432C` | `#C43320` | `#FDEDEB` | `rgba(232,67,44,0.1)` | Risk, critical, high-risk thresholds |
| **Amber** | `#D97706` | `#B45309` | `#FDF1E4` | `rgba(217,119,6,0.1)` | Monitor, borderline, action required |
| **Green** | `#14866D` | `#0E6354` | `#E6F3F0` | `rgba(20,134,109,0.1)` | Optimal, improving, resolved |
| **Blue** | `#1D6FA4` | `#155B8A` | `#E8F1F6` | `rgba(29,111,164,0.1)` | Informational, nutritional |
| **Purple** | `#7C3AED` | `#5B21B6` | `#F2EBFD` | `rgba(124,58,237,0.1)` | Hormonal, neurological, longevity |

**Color Usage Rules:**
- **Brand Blue**: Section labels, kickers, active states, CTA buttons, headline emphasis. **NEVER** for health status signalling or data visualization.
- **Rose**: Critical health alerts, risk signals only. **NEVER** for brand identity or decorative fills.
- **Amber**: Borderline biomarkers, "monitor" status. **NEVER** for positive outcomes.
- **Green**: Optimal ranges, improving trends, resolved alerts, live indicators. **NEVER** for neutral content.
- **Blue**: Informational notes, nutritional markers. **NEVER** for risk communication.
- **Purple**: Hormonal markers, longevity metrics. **NEVER** for primary actions or critical alerts.

### 1.4 Color — Visualization Palette (8 tokens)

| Token | Value | Usage |
|---|---|---|
| `--viz-1` | `#0A6E5C` | Metabolic category |
| `--viz-2` | `#1B4965` | Cardiac category |
| `--viz-3` | `#D97706` | Threshold lines |
| `--viz-4` | `#E8432C` | Risk data |
| `--viz-5` | `#7C3AED` | Hormonal category |
| `--viz-6` | `#4B5563` | Neutral/secondary |
| `--viz-7` | `#0EA5E9` | Info/supplementary |
| `--viz-8` | `#14B8A6` | Positive/tertiary |

**Rule**: Never use more than 3 colours in a single chart.

### 1.5 Type Scale

| Token | Value | Usage |
|---|---|---|
| `--ts-2xs` | `10px` | Kicker labels, meta text |
| `--ts-xs` | `11px` | Section tags, uppercase labels |
| `--ts-sm` | `13px` | UI labels, table cells, nav links |
| `--ts-md` | `15px` | Default body, card descriptions |
| `--ts-lg` | `17px` | Article body prose (Newsreader) |
| `--ts-xl` | `21px` | Dashboard module titles (Inter) |
| `--ts-2xl` | `28px` | Insight card headings |
| `--ts-3xl` | `38px` | Section headlines (Newsreader) |
| `--ts-4xl` | `52px` | Large display text |
| `--ts-5xl` | `68px` | Hero headline (Newsreader) |

### 1.6 Spacing (4px base unit)

| Token | Value | Usage |
|---|---|---|
| `--sp-1` | `4px` | Icon gap, tight label spacing |
| `--sp-2` | `8px` | Badge padding, chip gap |
| `--sp-3` | `12px` | Inline element gap |
| `--sp-4` | `16px` | Card padding small, grid gap |
| `--sp-5` | `20px` | Paragraph spacing |
| `--sp-6` | `24px` | Card padding standard |
| `--sp-7` | `32px` | Card padding large |
| `--sp-8` | `40px` | Section header spacing |
| `--sp-9` | `56px` | Section divider, article rhythm |
| `--sp-10` | `72px` | Section padding, hero spacing |

### 1.7 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--r-sm` | `6px` | Small elements, inner corners |
| `--r-md` | `10px` | Buttons, inputs, badges |
| `--r-lg` | `14px` | Cards, containers, frames |
| `--r-xl` | `20px` | Modals, featured cards, insight cards |
| `--r-pill` | `999px` | Badges, pill buttons, toggles |

### 1.8 Shadows

| Token | Value | Usage |
|---|---|---|
| `--sh-sm` | `0 1px 3px rgba(15,17,21,0.05)` | Badges, subtle card lift |
| `--sh-md` | `0 4px 6px -1px rgba(15,17,21,0.05), 0 2px 4px -2px rgba(15,17,21,0.05)` | Hovered cards, dropdowns |
| `--sh-lg` | `0 10px 15px -3px rgba(15,17,21,0.05), 0 4px 6px -4px rgba(15,17,21,0.05)` | Tooltips, popovers |
| `--sh-xl` | `0 20px 25px -5px rgba(15,17,21,0.05), 0 8px 10px -6px rgba(15,17,21,0.05)` | Modals, overlays |

### 1.9 Layout Constants

| Token | Value |
|---|---|
| `--sidebar` | `240px` |
| Prose max-width | `780px` |
| Wide max-width | `1040px` |

---

## 2. Typography System

### 2.1 Three Typefaces — Strict Roles

| Typeface | CSS Class | Role | Use For | NEVER Use For |
|---|---|---|---|---|
| **Newsreader** (serif) | `.display`, `.serif` | Display & Editorial | Hero headlines, section titles (`.ds-section-title`), pull quotes, stat numbers (large display) | Body text, card titles, subtitles, descriptions, labels |
| **Inter** (sans-serif) | Default (no class needed) | UI Workhorse | All card titles, subtitles, body text, descriptions, labels, buttons, navigation, all UI text | Main section headings, numeric values |
| **JetBrains Mono** (monospace) | `.mono`, `.nums` | Numbers & Code | **ALL numbers**: biomarker values, scores, percentages, dates, stat callouts, tokens, code, prices | Headings, body text, labels, buttons |

### 2.2 CSS Utility Classes

```css
.display  /* font-family: 'Newsreader', Georgia, serif; letter-spacing: -0.02em; */
.serif    /* font-family: 'Newsreader', Georgia, serif; */
.mono     /* font-family: 'JetBrains Mono', monospace; */
.nums     /* font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; */
```

### 2.3 Type Scale Specimens

| Scale | Font | Weight | Line-Height | Letter-Spacing | Use |
|---|---|---|---|---|---|
| `68px` (--ts-5xl) | Newsreader | 700 | 1.02 | -0.03em | Hero headline |
| `38px` (--ts-3xl) | Newsreader | 700 | 1.12 | -0.02em | Section title |
| `28px` (--ts-2xl) | Newsreader | 700 | 1.2 | -0.015em | Card heading, subheadline |
| `21px` (--ts-xl) | Inter | 600 | — | -0.01em | UI headline, modal title |
| `17px` (--ts-lg) | Newsreader | 400 | 1.85 | — | Article body, clinical notes |
| `15px` (--ts-md) | Inter | 400 | 1.6 | — | UI body, card copy, descriptions |
| `13px` (--ts-sm) | Inter | 500 | — | — | Labels, table cells, nav links |
| `11px` (--ts-xs) | Inter | 600 | — | 0.12em | Kickers, section tags (uppercase) |

### 2.4 Headline Emphasis Pattern

Section titles use Newsreader with `<em>` for brand-colored italic emphasis:
```html
<h2 class="ds-section-title">Design <em>Principles</em></h2>
```
The `<em>` renders as `font-style: italic; color: var(--brand);`

---

## 3. Global Reset & Base

```
Box-sizing: border-box (all elements)
html: scroll-behavior smooth, font-size 16px
body: background var(--n-50), color var(--n-800), font-family Inter, font-size var(--ts-md), line-height 1.5, -webkit-font-smoothing antialiased, display flex, min-height 100vh
Scrollbar: 4px width/height, track var(--n-50), thumb var(--n-200) radius 2px
```

---

## 4. Layout Shell

### 4.1 Sidebar `.sidebar`

| Property | Value |
|---|---|
| Width | `var(--sidebar)` (240px), min-width same |
| Height | `100vh`, position sticky, top 0 |
| Overflow | `overflow-y: auto` |
| Border | `border-right: 1px solid var(--n-200)` |
| Background | `var(--n-50)` |
| Padding | `28px 0 40px` |
| Flex | `flex-shrink: 0` |

**Sidebar Brand** `.sidebar-brand`: padding `0 20px 24px`, border-bottom `1px solid var(--n-200)`, margin-bottom `20px`.

**Logo** `.sb-logo`: Newsreader 16px 700 weight, `var(--n-900)`, flex with 8px gap. Dot `.sb-dot`: 7px circle, `var(--brand)` bg.

**Version** `.sb-version`: JetBrains Mono 10px, `var(--n-500)`, margin-top 5px, letter-spacing 0.06em.

**Section Label** `.sb-section`: 10px 600 weight, letter-spacing 0.1em, uppercase, `var(--n-500)`, padding `14px 20px 6px`.

**Nav Link** `.sb-link`:
- Default: block, padding `7px 20px`, 13px, `var(--n-600)`, no decoration, border-left 2px transparent, transition 0.15s
- Hover: `var(--n-900)` text, `var(--n-100)` bg
- Active: `var(--brand)` text, brand border-left, `var(--brand-lt)` bg, 500 weight

### 4.2 Main Content `.main-content`

`flex: 1; min-width: 0; overflow-y: auto;`

### 4.3 Topbar `.topbar`

| Property | Value |
|---|---|
| Position | `sticky; top: 0; z-index: 50` |
| Background | `rgba(249,250,251,0.94)` |
| Backdrop | `blur(12px)` |
| Border | `border-bottom: 1px solid var(--n-200)` |
| Padding | `0 40px` |
| Height | `52px` |
| Layout | `display: flex; align-items: center; gap: 16px` |

**Title** `.topbar-title`: 13px, `var(--n-600)`. `strong`: `var(--n-900)`, 600 weight.

**Right** `.topbar-right`: `margin-left: auto; display: flex; gap: 12px`.

**Badge** `.tb-badge`: 10px 600 weight, letter-spacing 0.08em, uppercase, padding `3px 9px`, pill radius, border `1px solid var(--n-200)`, `var(--n-600)`. `.tb-badge.live`: green color, green border, green-lt bg.

### 4.4 Section `.ds-section`

| Property | Value |
|---|---|
| Padding | `64px 40px 48px` |
| Border-bottom | `1px solid var(--n-200)` (last-child: none) |
| Max-width | `1040px` |
| Animation | `fadeUp 0.4s ease both` |

**Section Label** `.ds-section-label`: 10px 700 weight, letter-spacing 0.15em, uppercase, `var(--brand)`, margin-bottom 12px, flex with 10px gap. `::after` pseudo: 1px line, `var(--n-200)`, max-width 80px.

**Section Title** `.ds-section-title`: Newsreader, `clamp(28px, 3vw, 40px)`, 700 weight, line-height 1.1, letter-spacing -0.025em, `var(--n-900)`, margin-bottom 10px.

**Section Sub** `.ds-section-sub`: Inter, 15px, `var(--n-600)`, line-height 1.75, max-width 560px, margin-bottom 40px.

### 4.5 Chapter Divider `.chapter-div`

Flex centered, 16px gap, margin `52px 0 36px`, 10px 700 weight, letter-spacing 0.15em, uppercase, `var(--n-500)`. `::before` and `::after`: flex-1 1px line `var(--n-200)`.

### 4.6 Component Frame `.comp-frame`

Container for component demos:
- Border: `1px solid var(--n-200)`, radius `var(--r-lg)`, overflow hidden, margin-bottom 28px
- **Preview** `.comp-preview`: padding 32px, `var(--n-0)` bg, border-bottom `1px solid var(--n-200)`, flex wrap, 16px gap, align-items flex-start
  - `.comp-preview.col`: flex-direction column
  - `.comp-preview.grid2`: grid 2 columns, 16px gap
- **Footer** `.comp-footer`: padding `12px 20px`, `var(--n-50)` bg, 11px JetBrains Mono, `var(--n-500)`, flex, 12px gap
- **Tag** `.comp-tag`: 10px 700 weight, letter-spacing 0.1em, uppercase, padding `2px 8px`, pill radius, `var(--n-100)` bg, `var(--n-600)` text

---

## 5. Badges & Tags

### 5.1 Badge `.badge`

| Property | Value |
|---|---|
| Display | `inline-flex; align-items: center; gap: 5px` |
| Padding | `4px 11px` |
| Border-radius | `var(--r-pill)` (999px) |
| Font | `12px; font-weight: 500` |

### 5.2 Badge Variants

| Class | Background | Color | Semantic Use |
|---|---|---|---|
| `.badge-ok` | `var(--green-lt)` | `var(--green)` | Optimal, resolved, improving |
| `.badge-warn` | `var(--amber-lt)` | `var(--amber)` | Monitor, borderline, action required |
| `.badge-risk` | `var(--rose-lt)` | `var(--rose)` | High risk, critical |
| `.badge-info` | `var(--blue-lt)` | `var(--blue)` | Informational, normalizing |
| `.badge-purple` | `var(--purple-lt)` | `var(--purple)` | Hormonal |
| `.badge-neutral` | `var(--n-100)` | `var(--n-600)` | Pending, no data, metadata |

### 5.3 Badge Content Patterns

Badges include a leading symbol for accessibility (never colour alone):
- Optimal: `● Optimal`, `✓ Resolved`, `↑ Improving`
- Warning: `◎ Monitor`, `→ Action Required`
- Risk: `⚠ High Risk`, `↑ Critical`
- Info: `↓ Normalizing`, `ℹ Informational`
- Neutral: `● Pending`, `— No data`

### 5.4 Kicker `.kicker`

| Property | Value |
|---|---|
| Display | `inline-flex; align-items: center; gap: 8px` |
| Font | `11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase` |
| Color | `var(--brand)` (default) |
| `::before` | 22px × 2px bar, `var(--brand)` bg |

Variant colors: `var(--green)` for chapter wins, `var(--n-600)` for neutral section labels.

---

## 6. Buttons & Actions

### 6.1 Base `.btn`

| Property | Value |
|---|---|
| Display | `inline-flex; align-items: center; justify-content: center; gap: 8px` |
| Padding | `10px 20px` |
| Border-radius | `var(--r-md)` (10px) |
| Font | `13px; font-weight: 500; font-family: 'Inter', sans-serif; line-height: 1` |
| Cursor | `pointer` |
| Border | `1px solid transparent` |
| Transition | `all 0.2s cubic-bezier(0.22, 1, 0.36, 1)` |
| User-select | `none` |
| Focus-visible | `outline: 2px solid var(--brand); outline-offset: 2px` |
| Active (not disabled) | `transform: scale(0.97)` |

### 6.2 Button Variants

| Variant | Class | Background | Text | Border | Hover | Disabled |
|---|---|---|---|---|---|---|
| **Primary** | `.btn-primary` | `var(--n-900)` | `var(--n-0)` | `var(--n-900)` | `var(--n-800)` + `box-shadow: 0 2px 8px rgba(15,17,21,.15)` | bg `var(--n-300)`, border `var(--n-300)`, text `var(--n-0)`, cursor not-allowed, opacity 1 |
| **Secondary** | `.btn-secondary` | `var(--n-0)` | `var(--n-900)` | `var(--n-200)` | bg `var(--n-50)`, border `var(--n-300)`, `box-shadow: 0 1px 4px rgba(15,17,21,.06)` | bg `var(--n-50)`, text `var(--n-400)`, border `var(--n-200)` |
| **Tertiary** | `.btn-tertiary` | `transparent` | `var(--n-600)` | `transparent` | text `var(--n-900)`, bg `var(--n-100)` | text `var(--n-400)` |
| **Brand** | `.btn-brand` | `var(--brand)` | `#fff` | `var(--brand)` | bg `var(--brand-dk)`, `box-shadow: 0 2px 8px rgba(37,99,235,.25)` | opacity 0.45 |
| **Danger** | `.btn-danger` | `var(--rose)` | `#fff` | `var(--rose)` | bg `var(--rose-dk)`, `box-shadow: 0 2px 8px rgba(232,67,44,.25)` | opacity 0.45 |
| **Ghost** | `.btn-ghost` | `transparent` | `var(--n-600)` | `transparent` | text `var(--n-900)`, bg `var(--n-100)` | — |
| **Link** | `.btn-link` | `transparent` | `var(--brand)` | `none` (has `border-bottom: 1px solid rgba(37,99,235,.3)`) | text `var(--brand-dk)`, solidify underline | text `var(--n-400)`, border `var(--n-300)` |

### 6.3 Button Sizes

| Size | Class | Padding | Font | Gap |
|---|---|---|---|---|
| Small | `.btn-sm` | `7px 14px` | `12px` | `6px` |
| Default | — | `10px 20px` | `13px` | `8px` |
| Large | `.btn-lg` | `13px 26px` | `15px` | `10px` |
| Icon (square) | `.btn-icon` | `9px` | — | — |
| Icon SM | `.btn-icon.btn-sm` | `6px` | — | — |
| Icon LG | `.btn-icon.btn-lg` | `12px` | — | — |

### 6.4 Button Shapes

| Shape | Class | Border-radius |
|---|---|---|
| Default | — | `var(--r-md)` (10px) |
| Pill | `.btn-pill` | `var(--r-pill)` (999px) |
| Icon Circle | `.btn-icon-circle` | `50%` |

### 6.5 Loading States

**Spinner Only** `.btn-loading`:
- Text becomes transparent (`color: transparent !important`)
- `pointer-events: none`
- `::after` pseudo: 16px spinner, 2px border, 0.5s linear infinite rotation
- Primary/Brand/Danger: white spinner. Secondary/Tertiary: dark spinner (`var(--n-700)` top border).

**Spinner + Text** `.btn-loading-text`:
- `pointer-events: none; opacity: 0.85`
- Uses inline `<span class="btn-spinner"></span>` before label text
- Spinner: 14px, same colour logic as above

### 6.6 Inline CTA Links `.ic-cta`

| Property | Value |
|---|---|
| Display | `inline-flex; align-items: center; gap: 6px` |
| Font | Inter 14px, 600 weight |
| Border-bottom | `1px solid` at 30% opacity of color |
| Padding-bottom | `2px` |
| Hover | `border-color: currentColor` |

Color matches semantic context: brand, green, amber, purple.

### 6.7 Button Combination Rules

- **Dialog actions**: Tertiary (Cancel) left, Primary (Confirm) right. Right-align with `justify-content: flex-end`.
- **Destructive confirmation**: Secondary (Keep) left, Danger (Delete) right.
- **Multi-action**: Brand (primary CTA) + Secondary + optional Link. Brand is largest.
- **Rule**: Primary always right-most. Cancel/Tertiary always left. Danger replaces Primary in destructive flows.

---

## 7. Cards & Containers

### 7.1 Base Card `.ds-card`

| Property | Value |
|---|---|
| Border | `1px solid var(--n-200)` |
| Border-radius | `var(--r-lg)` (14px) |
| Background | `var(--n-0)` |
| Padding | `24px` |
| Transition | `box-shadow 0.2s, transform 0.2s` |
| Hover | `box-shadow: var(--sh-md); transform: translateY(-1px)` |

**Modifiers:**
| Class | Effect |
|---|---|
| `.elevated` | `box-shadow: var(--sh-md)` (always visible) |
| `.bordered-rose` | `border-left: 3px solid var(--rose)` |
| `.bordered-green` | `border-left: 3px solid var(--green)` |
| `.bordered-amber` | `border-left: 3px solid var(--amber)` |
| `.bg-tinted` | `background: var(--n-50)` |

### 7.2 Stat Callout `.stat-callout`

| Property | Value |
|---|---|
| Border-left | `3px solid var(--brand)` |
| Padding | `20px 24px` |
| Background | `var(--n-50)` |
| Border-radius | `0 var(--r-md) var(--r-md) 0` |

- **Number** `.sc-num`: JetBrains Mono, 48px, 700 weight, line-height 1, letter-spacing -0.02em
- **Label** `.sc-label`: Inter, 15px, `var(--n-800)`, margin-top 6px

### 7.3 Pull Quote `.pull-quote`

| Property | Value |
|---|---|
| Font | Newsreader, `clamp(18px, 2vw, 23px)`, italic, 400 weight |
| Line-height | `1.5` |
| Color | `var(--n-900)` |
| Padding | `24px 0` |
| Border-top | `2px solid var(--n-900)` |
| Border-bottom | `1px solid var(--n-200)` |

### 7.4 CTA Card `.cta-card`

| Property | Value |
|---|---|
| Border | `1px solid var(--n-200)` |
| Border-radius | `var(--r-lg)` |
| Background | `var(--n-0)` |
| Padding | `24px` |
| Hover | `box-shadow: var(--sh-md); transform: translateY(-2px)` |

**Structure:**
```html
<div class="cta-card">
  <div class="cta-card-title">...</div>      <!-- 17px, 600, var(--n-900), mb 6px -->
  <div class="cta-card-sub">...</div>         <!-- 13px, line-height 1.65, var(--n-600), mb 20px -->
  <div class="cta-card-actions">              <!-- flex, gap 12px -->
    <button class="btn btn-brand btn-sm">...</button>
    <button class="btn btn-secondary btn-sm">...</button>  <!-- optional -->
  </div>
</div>
```

### 7.5 Image Card `.image-card`

| Property | Value |
|---|---|
| Border | `1px solid var(--n-200)` |
| Border-radius | `var(--r-lg)` |
| Background | `var(--n-0)` |
| Overflow | `hidden` |
| Hover | `box-shadow: var(--sh-md); transform: translateY(-2px)` |

**Structure:**
```html
<div class="image-card">
  <img class="image-card-img" />  <!-- width 100%, aspect-ratio 16/9, object-fit cover -->
  <div class="image-card-body">   <!-- padding 24px -->
    <div class="image-card-title">...</div>  <!-- 17px, 600, var(--n-900), mb 6px -->
    <div class="image-card-sub">...</div>    <!-- 13px, line-height 1.65, var(--n-600), mb 20px -->
    <button class="btn btn-brand btn-sm">...</button>
  </div>
</div>
```

---

## 8. Forms & Inputs

### 8.1 Text Input `.ds-input`

| Property | Value |
|---|---|
| Width | `100%` |
| Padding | `10px 14px` |
| Border | `1px solid var(--n-200)` |
| Border-radius | `var(--r-md)` |
| Background | `var(--n-0)` |
| Font | Inter 14px, `var(--n-900)` |
| Focus | `border-color: var(--n-900)` |
| Placeholder | `color: var(--n-500)` |

Works for `<input>`, `<select>`, and `<textarea>`.

### 8.2 Label `.ds-label`

| Property | Value |
|---|---|
| Font | `11px; font-weight: 600; letter-spacing: 0.04em` |
| Color | `var(--n-600)` |
| Margin-bottom | `5px` |

---

## 9. Advanced Forms

### 9.1 Search Input `.search-input-wrap`

Wraps a `.ds-input` with a positioned search icon:
- Wrapper: `position: relative; width: 100%`
- Icon `.search-icon`: absolute, left 12px, vertically centered, 18px, `var(--n-400)`
- Input gets `padding-left: 38px`

### 9.2 Checkbox Group `.checkbox-group`

Container: flex column, 12px gap.

**Checkbox Item** `.checkbox-item`: flex, align-items flex-start, 10px gap, cursor pointer.

**Checkbox Box** `.checkbox-box`:
- Default: 18px square, 1.5px border `var(--n-300)`, radius 4px, `var(--n-0)` bg, transition 0.15s
- Checked `.checked`: bg `var(--brand)`, border `var(--brand)`, white check SVG visible
- SVG inside: 12px, hidden by default, displayed when `.checked`

**Labels**: `.checkbox-label` 14px `var(--n-800)`, `.checkbox-desc` 12px `var(--n-500)` margin-top 1px.

### 9.3 Radio Group `.radio-group`

Container: flex column, 14px gap.

**Radio Item** `.radio-item`: flex, align-items flex-start, 10px gap, cursor pointer.

**Radio Dot** `.radio-dot`:
- Default: 18px circle, 1.5px border `var(--n-300)`, `var(--n-0)` bg, transition 0.15s
- Selected `.selected`: border `var(--brand)`, `::after` pseudo 10px circle filled `var(--brand)`

**Labels**: `.radio-label` 14px 500 weight `var(--n-800)`, `.radio-desc` 12px `var(--n-500)` margin-top 2px, line-height 1.5.

### 9.4 Number Stepper `.number-stepper`

| Property | Value |
|---|---|
| Display | `inline-flex; align-items: center` |
| Border | `1px solid var(--n-200)` |
| Border-radius | `var(--r-md)` |
| Background | `var(--n-0)` |

- **Buttons** `.number-stepper-btn`: 36px square, `var(--n-50)` bg, `var(--n-600)` text, 16px 600 weight. Hover: `var(--n-100)` bg.
- **Value** `.number-stepper-value`: 56px wide, center-aligned, JetBrains Mono 14px 600, `var(--n-900)`, bordered left/right with `var(--n-200)`.

### 9.5 File Upload `.file-upload`

| Property | Value |
|---|---|
| Border | `2px dashed var(--n-200)` |
| Border-radius | `var(--r-lg)` |
| Padding | `40px 24px` |
| Text-align | `center` |
| Hover | border `var(--brand)`, bg `var(--brand-lt)` |

Structure: Icon (40px, `var(--n-400)`) → Title (14px 600, `var(--n-800)`) → Sub (12px, `var(--n-500)`, "Click to browse" span in `var(--brand)`) → Format note (11px, `var(--n-400)`).

### 9.6 Copy Input `.copy-input-wrap`

Flex container: border `1px solid var(--n-200)`, radius `var(--r-md)`, `var(--n-0)` bg.
- **Input**: flex 1, padding `10px 14px`, JetBrains Mono 13px, `var(--n-700)`, no border
- **Button**: padding `10px 16px`, `var(--n-50)` bg, border-left `1px solid var(--n-200)`, 12px 600, `var(--n-600)`. Hover: `var(--n-100)` bg.

---

## 10. Tables

### 10.1 Data Table `.ds-table`

| Property | Value |
|---|---|
| Width | `100%` |
| Border-collapse | `collapse` |
| Font-size | `13px` |

**Header `th`**: 10px 700 weight, letter-spacing 0.1em, uppercase, `var(--n-500)`, padding `10px 16px`, left-aligned, border-bottom `1px solid var(--n-200)`, bg `var(--n-50)`.

**Cell `td`**: padding `12px 16px`, border-bottom `1px solid var(--n-100)`, `var(--n-700)`, vertical-align middle. Last row: no border-bottom.

**Row hover**: `td` bg `var(--n-50)`.

**Token cell** `.td-token`: JetBrains Mono 11px, `var(--brand)`.

---

## 11. List Cells

### 11.1 Base List Cell `.list-cell`

| Property | Value |
|---|---|
| Display | `flex; align-items: center; gap: 14px` |
| Padding | `14px 20px` |
| Border-bottom | `1px solid var(--n-100)` (last-child: none) |
| Hover | `background: var(--n-50)` |
| Transition | `background 0.12s` |

**Icon** `.list-cell-icon`: 40px square, `var(--r-md)` radius, flex centered, brand-lt bg, brand color (default). Override bg/color per semantic context.

**Body** `.list-cell-body`: flex 1, min-width 0.
- `.list-cell-title`: 14px 600, `var(--n-900)`, line-height 1.3
- `.list-cell-sub`: 12px, `var(--n-500)`, line-height 1.4, margin-top 2px
- `.list-cell-date`: 10px JetBrains Mono, `var(--n-500)`, margin-bottom 2px

**Right** `.list-cell-right`: flex-shrink 0, flex, 8px gap. Can contain badges, chips, buttons, or chevron.

**Chevron** `.list-cell-chevron`: 20px, `var(--n-400)`.

**Chips** `.list-cell-chips`: flex wrap, 6px gap.
- `.list-cell-chip`: 11px, padding `3px 10px`, pill radius, `var(--n-100)` bg, `var(--n-600)`, 500 weight.

### 11.2 List Group `.list-group`

Border `1px solid var(--n-200)`, `var(--r-lg)` radius, overflow hidden, `var(--n-0)` bg.

**Header** `.list-group-header`: padding `14px 20px`, `var(--n-50)` bg, border-bottom, 11px 700, letter-spacing 0.08em, uppercase, `var(--n-600)`.

### 11.3 Accordion `.accordion-cell`

Border-bottom `1px solid var(--n-100)` (last-child: none).

**Header** `.accordion-header`: flex, 14px gap, padding `14px 20px`, cursor pointer, hover `var(--n-50)` bg.

**Chevron** `.accordion-chevron`: 20px, `var(--n-400)`, transition transform 0.2s, margin-left auto. `.accordion-chevron.open`: `rotate(180deg)`.

**Body** `.accordion-body`: padding `0 20px 16px 74px`, 13px, `var(--n-600)`, line-height 1.65.

---

## 12. Icon Grids

### 12.1 Grid Container `.ds-icon-grid`

`display: grid; gap: 12px`.
- `.grid-3x3`: `grid-template-columns: repeat(3, 1fr)`
- `.grid-4x3`: `grid-template-columns: repeat(4, 1fr)`

### 12.2 Grid Item `.ds-icon-grid-item`

Flex column, centered, 8px gap, padding `16px 8px`, `var(--r-md)` radius, hover `var(--n-100)` bg.

**Icon Circle**: 44px, border-radius 50%, flex centered. SVG 20px. Color: semantic light bg + semantic text color.

**Label** `.icon-grid-label`: 11px, `var(--n-600)`, center-aligned, 500 weight.

### 12.3 Compact 4x3 Variant

Smaller: padding `10px 4px`, circle 36px, icon 16px, label 10px.

### 12.4 Icon Grid Card `.icon-grid-card`

Bordered card wrapping a grid. min-width 343px.
- **Header**: padding `16px 20px`, border-bottom, 14px 600, `var(--n-900)`
- **Body**: padding 20px

---

## 13. Toggle / Switch

### 13.1 Toggle `.toggle`

| Property | Value |
|---|---|
| Display | `inline-block; position: relative` |
| Size (default) | `44px × 24px` |
| Size (small `.sm`) | `36px × 20px` |
| Border-radius | `var(--r-pill)` |
| Background (off) | `var(--n-200)` |
| Background (on `.on`) | `var(--brand)` |
| Transition | `background 0.2s` |

**Knob** `.toggle-knob`:
- Position absolute, top 2px, left 2px
- Default size: 20px circle (small: 16px)
- Background `var(--n-0)`, shadow `0 1px 3px rgba(0,0,0,.15)`
- On state: `transform: translateX(20px)` (small: 16px)

### 13.2 Toggle Card `.toggle-card`

Border `1px solid var(--n-200)`, radius `var(--r-lg)`, `var(--n-0)` bg, padding 20px, flex, 16px gap.
- Body: flex 1, `.toggle-card-title` 14px 600 `var(--n-900)`, `.toggle-card-sub` 12px `var(--n-500)` mt 2px
- Toggle on the right

### 13.3 Toggle Section `.toggle-section`

Bordered container with stacked rows.
- `.toggle-row`: flex between, padding `16px 20px`, border-bottom `1px solid var(--n-100)` (last: none)
- `.toggle-row-label`: 14px 500, `var(--n-800)`

---

## 14. Card Variants

### 14.1 Icon Chevron Card `.icon-chevron-card`

Navigation card: border, `var(--r-lg)`, `var(--n-0)` bg, padding 20px, flex, 16px gap, cursor pointer.
Hover: `var(--sh-md)`, translateY(-1px).

- **Icon** `.icc-icon`: 44px square, `var(--r-md)` radius, semantic colors
- **Body** `.icc-body`: flex 1, `.icc-title` 15px 600 `var(--n-900)`, `.icc-sub` 13px `var(--n-500)` mt 2px
- **Chevron** `.icc-chevron`: 20px, `var(--n-400)`, right-pointing

### 14.2 Featured Card `.featured-card`

| Property | Value |
|---|---|
| Border | `1px solid var(--n-200)` |
| Border-radius | `var(--r-xl)` (20px) |
| Overflow | `hidden` |
| Hover | `box-shadow: var(--sh-lg); transform: translateY(-2px)` |

**Header**: padding `28px 24px`, gradient `linear-gradient(135deg, var(--brand) 0%, var(--brand-accent) 100%)`, white text.
- Badge: `background: rgba(255,255,255,0.2); color: #fff`
- Title: 22px 700, margin-top 12px
- Sub: 13px, opacity 0.85

**Body**: padding 24px, `var(--n-0)` bg.

### 14.3 Pricing Card `.pricing-card`

| Property | Value |
|---|---|
| Border | `1px solid var(--n-200)` |
| Border-radius | `var(--r-lg)` |
| Padding | `32px 28px` |
| Text-align | `center` |
| Hover | `var(--sh-lg); translateY(-2px)` |

**Popular variant** `.popular`: border `var(--brand)`, `box-shadow: 0 0 0 1px var(--brand)`.

Structure:
- Plan name: 12px 700, letter-spacing 0.1em, uppercase, `var(--n-500)` (popular: `var(--brand)`)
- Price: JetBrains Mono 44px 700, `var(--n-900)`. Period span: 16px 400, `var(--n-500)`
- Description: 13px, `var(--n-500)`, margin-bottom 24px
- Feature list: left-aligned, 13px `var(--n-700)`, 8px padding rows, border-bottom, check icon 16px `var(--green)`
- CTA button: full width. Popular gets `.btn-brand`, others `.btn-secondary`

---

## 15. Navigation Components

### 15.1 Underline Tabs `.tabs-underline`

Container: flex, border-bottom `1px solid var(--n-200)`, no gap.

**Tab** `.tab-underline`:
- Padding `12px 20px`, 13px 500, `var(--n-500)`, border-bottom 2px transparent, margin-bottom -1px
- Hover: `var(--n-800)` text
- Active: `var(--brand)` text, brand border-bottom, 600 weight

### 15.2 Pill Tabs `.tabs-pill`

Container: flex, 4px gap, `var(--n-100)` bg, `var(--r-md)` radius, 4px padding.

**Tab** `.tab-pill`:
- Padding `8px 18px`, 13px 500, `var(--n-500)`, `var(--r-sm)` radius
- Hover: `var(--n-800)` text
- Active: `var(--n-0)` bg, `var(--n-900)` text, 600 weight, `var(--sh-sm)` shadow

### 15.3 Pagination `.pagination`

Flex, 4px gap.

**Page Button** `.page-btn`: 36px square, flex centered, border `1px solid var(--n-200)`, `var(--r-md)` radius, 13px 500 JetBrains Mono, `var(--n-600)`, `var(--n-0)` bg.
- Hover: `var(--n-50)` bg, `var(--n-300)` border
- Active: `var(--brand)` bg, `#fff` text, brand border
- Disabled: `var(--n-300)` text, not-allowed, pointer-events none
- Nav button `.nav-btn`: auto width, padding `0 12px`, Inter font

**Dots** `.page-dots`: 36px square, centered, 13px, `var(--n-400)`.

### 15.4 Breadcrumbs `.breadcrumbs`

Flex, 6px gap, 13px.
- Links: `var(--n-500)`, no decoration, hover `var(--brand)`
- Separator `.bc-sep`: `var(--n-300)`, 11px
- Current `.bc-current`: `var(--n-800)`, 600 weight

---

## 16. Modals & Panels

### 16.1 Modal Dialog

**Backdrop** `.modal-backdrop`: `background: rgba(15,17,21,0.35)`, `var(--r-lg)` radius, padding 40px, flex centered, min-height 340px.

**Dialog** `.modal-dialog`: `var(--n-0)` bg, `var(--r-xl)` radius, `var(--sh-xl)` shadow, max-width 440px, overflow hidden.

- **Header** `.modal-header`: padding `24px 24px 0`, flex between
  - Title `.modal-header-title`: 18px 700, `var(--n-900)`
  - Close `.modal-close`: 32px square, `var(--r-md)` radius, flex centered, `var(--n-400)`, hover `var(--n-100)` bg
- **Body** `.modal-body`: padding `16px 24px 24px`, 14px, `var(--n-600)`, line-height 1.65
- **Footer** `.modal-footer`: padding `16px 24px`, border-top, `var(--n-50)` bg, flex end, 10px gap

### 16.2 Slide Panel (Drawer)

**Demo Container** `.slide-panel-demo`: flex, `var(--r-lg)` radius, overflow hidden, min-height 340px, light bg.

**Panel** `.slide-panel`: width 320px, `var(--n-0)` bg, border-left, `var(--sh-xl)` shadow, flex column.
- **Header** `.slide-panel-header`: padding 20px, border-bottom, flex between. Title: 16px 700 `var(--n-900)`.
- **Body** `.slide-panel-body`: padding 20px, flex 1, 14px `var(--n-600)`, line-height 1.65
- **Footer** `.slide-panel-footer`: padding `16px 20px`, border-top, flex, 10px gap

---

## 17. Avatars

### 17.1 Base Avatar `.avatar`

Circle, flex centered, 600 weight, white text, brand bg (default), uppercase, line-height 1, flex-shrink 0.

| Size | Class | Dimensions | Font |
|---|---|---|---|
| XS | `.avatar-xs` | 24px | 9px |
| SM | `.avatar-sm` | 32px | 11px |
| MD | `.avatar-md` | 40px | 13px |
| LG | `.avatar-lg` | 48px | 16px |
| XL | `.avatar-xl` | 64px | 22px |

### 17.2 Status Indicator `.avatar-status`

Wrapper: `position: relative; display: inline-flex`.

**Status Dot** `.avatar-status-dot`: absolute, bottom 0, right 0, 10px circle, 2px white border.
| Class | Color |
|---|---|
| `.online` | `var(--green)` |
| `.away` | `var(--amber)` |
| `.busy` | `var(--rose)` |
| `.offline` | `var(--n-300)` |

### 17.3 Avatar Group `.avatar-group`

Flex row. Each `.avatar` gets `margin-left: -8px` (first-child: 0) and `border: 2px solid var(--n-0)`.

Overflow count: last avatar with `+N` text, `var(--n-400)` bg.

---

## 18. Health Profiles

### 18.1 Health Profile Card `.health-profile-card`

Border, `var(--r-lg)` radius, `var(--n-0)` bg, padding 24px, flex, 20px gap. Hover: `var(--sh-md)`.

Structure: Avatar (XL) + Info block:
- `.health-profile-name`: 16px 700 `var(--n-900)`, mb 4px
- `.health-profile-role`: 12px `var(--n-500)`, mb 12px
- Score label + `.nums` value
- `.health-score-bar`: 6px height, `var(--n-100)` bg, 3px radius, overflow hidden
  - `.health-score-fill`: color matches status (green/amber/rose)
- `.health-profile-badges`: flex wrap, 6px gap, mt 12px

### 18.2 Health Row `.health-row`

Flex row: 16px gap, padding `14px 20px`, border-bottom. Hover: `var(--n-50)`.

Layout: Avatar(SM) + Name(flex 1, 14px 500) + Score(mono 14px 600) + Bar(flex 2, 6px height) + Badge.

---

## 19. Skeleton Loaders

### 19.1 Shimmer Animation

```css
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
```

### 19.2 Base Skeleton `.skeleton`

`background: linear-gradient(90deg, var(--n-100) 25%, var(--n-50) 50%, var(--n-100) 75%); background-size: 800px 100%; animation: shimmer 1.5s ease infinite; border-radius: var(--r-md);`

### 19.3 Skeleton Shapes

| Class | Radius | Usage |
|---|---|---|
| `.skeleton-line` | `var(--r-sm)` | Text placeholders, 12px height, mb 12px |
| `.skeleton-circle` | `50%` | Avatar placeholders |
| `.skeleton-rect` | `var(--r-md)` | Button/image placeholders |

**Width modifiers**: `.w-40`, `.w-60`, `.w-80`, `.w-100`.

### 19.4 Skeleton Containers

- **Card** `.skeleton-card`: bordered card, padding 24px
- **Row** `.skeleton-row`: flex, 14px gap, padding `14px 20px`, border-bottom
- **Chart** `.skeleton-chart`: bordered card, padding 24px, contains bar-shaped placeholders
- **Table** `.skeleton-table`: bordered container. Header `.skeleton-table-header`: `var(--n-50)` bg, border-bottom, flex, 20px gap

---

## 20. Empty States

### 20.1 Empty State `.empty-state`

| Property | Value |
|---|---|
| Text-align | `center` |
| Padding | `48px 24px` |

**Structure:**
- **Icon** `.empty-state-icon`: 64px circle, `var(--n-100)` bg (or branded), `var(--n-400)` color, flex centered, margin 0 auto 20px. SVG: 28px.
- **Title** `.empty-state-title`: 18px 700, `var(--n-900)`, mb 8px
- **Description** `.empty-state-desc`: 14px, `var(--n-500)`, line-height 1.65, max-width 360px, margin `0 auto 24px`
- **Actions** `.empty-state-actions`: flex centered, 10px gap

**Variants:**
- Default: neutral icon circle
- Search/no results: branded icon circle (`var(--brand-lt)` bg, `var(--brand)` color)

---

## 21. Stepper Progress

### 21.1 Horizontal Stepper `.stepper-h`

Flex row, width 100%.

**Step** `.stepper-h-step`: flex 1, flex column, centered, relative.
- Connecting line (`:not(:last-child)::after`): absolute, top 16px, between dots, 2px height, `var(--n-200)`. Completed: `var(--brand)`.

**Dot** `.stepper-h-dot`: 32px circle, flex centered, 12px JetBrains Mono 700 white, `var(--n-200)` bg, z-index 1.
- Completed: `var(--brand)` bg, check SVG
- Active: `var(--brand)` bg, `box-shadow: 0 0 0 4px var(--brand-lt)` glow ring

**Label** `.stepper-h-label`: 11px 500, `var(--n-500)`, mt 10px, centered.
- Completed/Active: `var(--brand)` text. Active: 700 weight.

### 21.2 Vertical Stepper `.stepper-v`

Flex column. Steps have `padding-bottom: 32px` (last: 0).

Connecting line: absolute, left 15px, 2px width, `var(--n-200)`. Completed: `var(--brand)`.

**Body** `.stepper-v-body`: padding-top 4px.
- Label: 14px 600, `var(--n-500)`. Completed: `var(--n-800)`. Active: `var(--brand)` 700.
- Description: 12px `var(--n-500)`, mt 4px, line-height 1.5.

---

## 22. Data Visualization

### 22.1 Chart.js Global Defaults

```
Font family: 'Inter', -apple-system, sans-serif
Font size: 11
Color: #9CA3AF
```

### 22.2 Tooltip Style (all charts)

| Property | Value |
|---|---|
| Background | `#0F1115` (var(--ink)) |
| Corner radius | `8px` |
| Padding | `10px` |
| Body color | `#F9FAFB` |
| Title color | `#9CA3AF` |
| Title font | JetBrains Mono 10px |
| Body font | JetBrains Mono 12px |
| Border | `1px solid rgba(255,255,255,0.08)` |

### 22.3 Chart Types

**A. Line & Area Charts**
- **Area Trend**: Single biomarker, gradient fill (12-18% opacity), 2px stroke, tension 0.4, point radius 3, white border 2px. One colour per chart.
- **Multi-Series Line**: Max 2-3 series. Solid vs dashed to differentiate.
- **Stepped Line**: Discrete value transitions (dosage changes, protocol switches).

**B. Bar Charts**
- **Stacked Bar**: Composition breakdown, borderRadius 2. Legend below.
- **Horizontal Bar**: Ranked comparisons.
- **Grouped Bar**: Side-by-side time period comparison, max 3 categories.

**C. Circular Charts**
- **Doughnut**: 65% cutout, 2.5px white border between segments, hoverOffset 6.
- **Polar Area**: Equal angles, radius = score.
- **Radar**: Max 2 series (current + previous), 6-8 axes. Current: solid 2px, Previous: dashed 1.5px `var(--n-400)`.

**D. Gauges & Meters**
- **Score Gauge (SVG)**: Semi-circle, 10px stroke, round cap. Score 0-100. 140x90 viewBox.
- **Risk Gauge**: Multi-zone (green/amber/rose) with needle indicator.
- **Linear Meter**: 8px horizontal fill bar with optimal zone overlay (tinted rectangle), range labels below in mono.

**E. Scatter & Bubble**
- **Scatter**: Colour = risk group, max 3 groups.
- **Bubble**: 3-variable: x, y, radius. Population health views.

**F. Heatmaps & Matrices**
- **Activity Heatmap**: Grid layout, opacity encodes intensity (15%-90%), one colour per row, rounded 4px cells.
- **Correlation Matrix**: Green = inverse, Rose = positive correlation. Diagonal = 1.0 (var(--n-900) bg). Opacity = strength.

**G. Specialized**
- **Sparklines**: Inline SVG, 120x24px, no axes, 1.5px stroke. Label + sparkline + value + trend inline.
- **Waterfall**: Contribution breakdown. Green bars = positive, Rose = negative, Brand = total.

### 22.4 Chart UI Elements

**Tooltip (custom HTML)**: Dark bg `var(--n-900)`, `var(--r-md)` radius, `var(--sh-lg)` shadow, 10px arrow.

**Reference Lines**: Solid green = optimal threshold. Dashed amber = borderline. Dashed rose = high-risk.

**Legend**: Inline flex, 14px gap, 12px × 3px colour swatch, 11px label `var(--n-600)`. Dashed swatch for thresholds.

### 22.5 Chart Design Rules

| Rule | Specification |
|---|---|
| Background | `var(--n-0)` or `var(--n-50)` |
| Grid lines | Horizontal only, `rgba(0,0,0,0.05)` |
| Axis labels | JetBrains Mono, 11px, `var(--n-500)` |
| Line weight | 2-2.5px stroke |
| Area fill | 12-18% opacity gradient |
| Data points | 4px radius, white border 2px |
| Colour usage | One semantic colour per chart |
| Heatmap opacity | 15%-90% of semantic colour |
| Gauge arcs | Semi-circle, 10px stroke, round cap |
| Sparklines | 120x24px, no axes, 1.5px stroke |
| Matrix cells | Green = inverse, Rose = positive |
| Max series | 3 per chart |

### 22.6 Data Table Pattern

Wrapped in bordered `var(--r-lg)` container with titled header bar (`var(--n-50)` bg, uppercase label). Table uses `.ds-table` with:
- Numbers in `.mono` class
- Changes with coloured trend indicators
- Status column with semantic badges
- Optimal ranges in `var(--n-500)` mono text

---

## 23. Editorial Patterns

### 23.1 Chapter Structure Pattern

```
Kicker → Display Headline → Body Prose → Pull Quote → Chart/Data
```

**Implementation:**
```html
<div class="kicker">Chapter 03 — LDL Analysis</div>
<div class="display" style="font-size:32px;font-weight:700;line-height:1.12;letter-spacing:-.02em;color:var(--n-900);">
  Your LDL has fallen <em><span class="nums">23%</span></em> — ...
</div>
<p style="font-size:15px;color:var(--n-600);line-height:1.8;max-width:600px;">
  Body prose with <span class="nums">148</span> mg/dL inline numbers...
</p>
<div class="pull-quote">"Clinical authority quote..."</div>
```

Rules:
- All inline numbers use `.nums` class (JetBrains Mono)
- `<em>` inside `.display` gets `font-style: italic; color: var(--brand)`
- Prose max-width: 600px with line-height 1.8
- Pull quotes follow body text, precede charts

### 23.2 Timeline Pattern

**Timeline Item** `.tl-item`: flex, 16px gap, padding-bottom 28px, relative.
- Connecting line `::before`: absolute, left 15px, top 36px to bottom, 1px `var(--n-200)`. Last-child: none.

**Dot** `.tl-dot`: 32px circle, 1.5px border `var(--n-200)`, `var(--n-50)` bg, flex centered, JetBrains Mono 12px 600, `var(--n-600)`.
- Semantic variants: green border/bg for resolved, amber for ongoing, purple for improving.

**Body** `.tl-body`:
- `.tl-date`: 10px JetBrains Mono, `var(--n-500)`, mb 3px
- `.tl-hed`: 14px 600, `var(--n-900)`, mb 4px
- `.tl-txt`: 13px, `var(--n-600)`, line-height 1.6

---

## 24. Biomarker UI Patterns

### 24.1 Range Visualization Row

5-column grid: `200px 1fr 100px 60px 140px`, padding `18px 24px`, border-bottom, hover `var(--n-50)`.

| Column | Content |
|---|---|
| Biomarker name | 14px 600 name + 11px category below |
| Range viz | `.range-viz` (6px bar) + optimal zone + thumb + mono range labels |
| Current value | `.mono` 18px 600 + 11px unit |
| Delta | `.trend-micro` (12px mono, semantic color) |
| Status | Semantic badge |

**Range Viz** `.range-viz`: 6px height, 3px radius, `var(--n-100)` bg, relative.
- `.range-optimal`: absolute zone, semantic color at ~20% opacity
- `.range-thumb`: absolute, 12px circle, 2px white border, semantic color fill, centered

**Trend Micro** `.trend-micro`: inline-flex, 3px gap, 12px JetBrains Mono 500.
| Class | Color | Meaning |
|---|---|---|
| `.up` | `var(--green)` | Increasing (positive) |
| `.down-good` | `var(--green)` | Decreasing (positive for markers where lower is better) |
| `.down-bad` | `var(--rose)` | Decreasing (negative) |
| `.flat` | `var(--n-400)` | No change |

### 24.2 Score Rings

**Large (Overall)** `score-ring-wrap`:
- SVG 120x120, circles r=52, 8px stroke
- Background circle: `var(--n-100)` stroke
- Score circle: semantic colour stroke, `stroke-dasharray/offset` for percentage, rotated -90deg
- Inner overlay: mono 28px 700 score + 10px label

**Small (Category)**: SVG 64x64, circles r=26, 5px stroke, mono 14px 600 score. Category label 11px 500, trend micro below.

**Animation**: `transition: stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)`.

### 24.3 Biomarker Detail Card `.bio-detail`

Border, `var(--r-lg)`, `var(--n-0)` bg, overflow hidden. Hover: `var(--sh-md)`, translateY(-1px).

**Structure:**
- **Head** `.bio-detail-head`: padding `20px 24px`, flex between. Category kicker (10px uppercase `var(--n-500)`) + name (17px 700) left, badge right.
- **Body** `.bio-detail-body`: padding `0 24px 20px`. Large value (mono 36px 700) + unit + trend. Sparkline SVG with gradient fill. Range viz bar + labels.
- **Footer** `.bio-detail-footer`: padding `12px 24px`, `var(--n-50)` bg, border-top, 11px `var(--n-500)`. Last tested date (mono) + guideline source.

### 24.4 Progress Bars `.prog-track` / `.prog-fill`

- Track: 5px height, `var(--n-100)` bg, 3px radius, overflow hidden
- Fill: 100% height, 3px radius, gradient `linear-gradient(to right, rgba(color, 0.5), color)`
- Labels above: 13px name left, score + status right (coloured)

### 24.5 Lab History Table `.lab-row`

Grid: `110px 1fr 90px 70px 100px`, 16px gap, padding `12px 24px`, border-bottom, hover `var(--n-50)`.
- Date: mono 12px
- Range: mini range-viz (4px height, 8px thumb)
- Value: mono 13px 600 + unit
- Delta: trend-micro
- Source: 11px `var(--n-500)`

### 24.6 Correlation Panel `.corr-pair`

Flex row: 12px gap, padding `14px 20px`, border-bottom, hover `var(--n-50)`.
- Name (min-width 160px): 13px 500 name + 10px strength label
- Bar `.corr-bar`: 4px height, `var(--n-100)` bg, flex 1, overflow hidden. Fill width = |r| percentage, gradient colour (rose = positive, green = inverse, amber = moderate)
- Value: mono 12px, `r = X.XX`
- Dot `.corr-dot`: 8px circle, semantic colour

### 24.7 Multi-Zone Range Bar `.multi-range`

10px height, 5px radius, flex, overflow hidden. Each zone div has semantic colour at low opacity (20-35%).
- Thumb: 14px circle, absolute centered on value position, white 2.5px border, semantic fill, shadow
- Zone labels below: mono 9px, semantic colours

### 24.8 Biological Age Panel

Large display comparison: Chronological age (mono 56px 700, `var(--n-300)`) → arrow → Biological age (mono 56px 700, `var(--green)`).
- Difference label: mono 10px uppercase green
- Footer grid: 4 columns of supporting longevity biomarkers (label 11px `var(--n-500)`, value mono 15px 600, sub 10px green)

### 24.9 Before/After Comparison Cards

Grid of 4 cards. Each:
- Top section (padding `16px 18px`): Label (11px `var(--n-500)`) + strikethrough old value (mono 13px `var(--n-400)`) + arrow + new value (mono 22px 700 `var(--n-900)`) + unit
- Bottom section: tinted semantic bg (green-lt, purple-lt), change percentage + context note

### 24.10 Protocol Tracker

Table-like grid with header row: Supplement | Dosage | Timing | Duration | Target Marker.
- Supplement: 13px 500 name + 10px `var(--n-400)` sub
- Dosage: mono 12px
- Target: semantic badge matching marker status

---

## 25. Insight Cards

### 25.1 Insight Card `.insight-card`

| Property | Value |
|---|---|
| Border | `1px solid var(--n-200)` |
| Border-radius | `var(--r-xl)` (20px) |
| Padding | `32px` |
| Background | `var(--n-0)` |
| Cursor | `pointer` |
| Hover | `box-shadow: var(--sh-lg); transform: translateY(-2px); border-color: var(--n-100)` |

**Structure (editorial pattern):**
1. **Tag Pill** `.ic-tag-pill`: inline-flex, padding `4px 10px`, pill radius, 11px 600, letter-spacing 0.06em, uppercase, mb 16px. Semantic light bg + colour.
2. **Headline** `.ic-hed`: Inter 22px 700, line-height 1.25, `var(--n-900)`, mb 12px.
3. **Body** `.ic-body`: Inter 14px, `var(--n-700)`, line-height 1.7, mb 24px.
4. **CTA** `.ic-cta`: inline-flex, 6px gap, Inter 14px 600, border-bottom `1px solid rgba(color, 0.3)`, padding-bottom 2px. Hover: solidify border.

**Semantic Variants:**
| Tag | Bg | Color | CTA Color |
|---|---|---|---|
| Positive Signal | `var(--green-lt)` | `var(--green)` | green |
| Action Required | `var(--amber-lt)` | `var(--amber)` | amber |
| Resolved | `var(--blue-lt)` | `var(--blue)` | blue |
| Improving | `var(--purple-lt)` | `var(--purple)` | purple |

---

## 26. Motion & Animation

### 26.1 Easing Curves

| Name | Value | Usage |
|---|---|---|
| Ease-out / Spring | `cubic-bezier(0.22, 1, 0.36, 1)` | Primary: card lifts, slide-up reveals, score ring animations |
| Ease-in-out / Smooth | `cubic-bezier(0.4, 0, 0.2, 1)` | Progress bar fills, chart line draws, sidebar nav |
| Overshoot / Bounce | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Reserved: score ring completion, bio age counter only |

### 26.2 Animation Specifications

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| Page section reveal | 650ms | ease-out spring | IntersectionObserver 8% |
| Score ring draw | 1400ms | ease-out spring | Page load, 200ms delay |
| Progress bar fill | 1200ms | ease-out spring | IntersectionObserver |
| Card hover lift | 200ms | ease | mouseenter |
| Modal open | 300ms | ease-out spring | click |
| Tooltip | 150ms | ease | mouseenter / data hover |

### 26.3 FadeUp (Section entrance)

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ds-section { animation: fadeUp 0.4s ease both; }
```

### 26.4 Button Spinner

```css
@keyframes btn-spin {
  to { transform: rotate(360deg); }
}
/* Duration: 0.5s linear infinite */
```

### 26.5 Skeleton Shimmer

```css
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
/* Duration: 1.5s ease infinite */
```

### 26.6 Reduced Motion

When `prefers-reduced-motion: reduce`, all animation/transition durations set to `0.01ms`.

---

## 27. Icon Library

### 27.1 Icon Specification

| Property | Value |
|---|---|
| Library | Feather Icons (feather-icons) |
| ViewBox | `24 × 24` |
| Style | Stroke only, no fill |
| Stroke width | `1.75px` |
| Stroke cap | `round` |
| Stroke join | `round` |
| Default colour | `var(--n-700)` (inherits `currentColor`) |

### 27.2 Icon Container `.icon-chip`

Width 64px, flex column centered, padding `10px 2px 6px`, `var(--r-md)` radius, hover `var(--n-100)` bg.
- SVG: 24px rendered
- Label `.icon-label`: 9px Inter, `var(--n-500)`, always visible below (no hover required)

### 27.3 Icon Categories

| Category | Key Icons |
|---|---|
| General & Common | home, search, settings, edit, trash, plus, check, heart, bell, calendar, clock |
| Navigation & Arrows | arrow-*, chevron-*, external-link, menu, grid, list, move, compass |
| Health & Medical | heart, activity, thermometer, droplet, eye, sun, moon, shield, target |
| Data & Analytics | bar-chart, trending-up/down, pie-chart, database, filter, sliders |
| Communication | message-square, mail, send, phone, video, mic, globe |
| Files & Documents | file, folder, download, upload, printer, clipboard, book, image |
| Security & Trust | lock, unlock, shield, key, alert-triangle, user-check |
| Interface & UI | layout, sidebar, grid, zoom-in/out, settings, sliders, toggle |
| Users & People | user, users, user-plus, smile, briefcase, award |
| Shapes & Symbols | circle, square, triangle, hexagon, star, heart, zap |

### 27.4 Icon Rules

| Rule | Specification |
|---|---|
| Touch target | 44px minimum (WCAG) |
| Labels | Always visible, 9px Inter — never hover-dependent |
| Accessibility | Always include `title` or `aria-label` |
| Consistency | One icon per concept (e.g., "heart" = cardiovascular, never "favourite") |

---

## 28. Voice & Tone

### 28.1 Writing Principles

| Principle | Means | Example |
|---|---|---|
| Lead with meaning | Tell user what data means, then show number | "Your body is ageing 4 years slower than average." |
| Name the trend | Describe direction, not just current value | "LDL has decreased 23% over 12 months" |
| Clinical, not clinical-feeling | Correct terminology explained in prose | "HbA1c — a 3-month average of blood glucose" |
| Show the evidence chain | Always cite the guideline source | "AHA/ACC threshold: <100 mg/dL" |
| No false urgency | Reserve rose for genuinely critical signals | Amber for "monitor", Rose for "critical" |

### 28.2 Do / Don't

**Do**: "Your LDL has decreased 23% over 12 months — a meaningful shift driven by specific, identifiable changes."

**Don't**: "Your cholesterol is HIGH! You need to take action immediately!" / "Great work! You're on your health journey!"

---

## 29. Accessibility Standards

### 29.1 Colour Contrast

| Pair | Ratio | Pass |
|---|---|---|
| Ink on Paper | 17.9:1 | AA |
| Rose on Paper | 4.8:1 | AA |
| Green on Paper | 4.6:1 | AA |
| Amber on Paper | 3.1:1 | AA (must pair with icon) |

### 29.2 Colour-Blindness Rules

- **NEVER** use colour alone to communicate biomarker status
- Always pair with: icon/symbol AND text label
- Range bars include text showing optimal range value
- Multi-series charts use colour + shape differentiation

### 29.3 Standards

| Rule | Standard | Applied In |
|---|---|---|
| Body text minimum | 13px / 0.8125rem | All UI labels, table cells |
| Interactive target | 44×44px minimum | All buttons, biomarker rows |
| Focus indicators | 2px outline, `var(--brand)` | All keyboard-navigable elements |
| Reading line length | Max 75 characters (780px) | All article body text |
| Chart annotations | Always text-labelled lines | Threshold lines on charts |
| Reduced motion | `prefers-reduced-motion: reduce` → pause | Score rings, reveals, counters |

---

## Responsive Breakpoints

### Mobile (max-width: 720px)

```
body: flex-direction column
.sidebar: width 100%, height auto, position static
.ds-section: padding 40px 20px 36px
.topbar: padding 0 20px
.comp-preview.grid2: single column
.type-row: single column, 8px gap
```

### Print

```
.sidebar: display none
.main-content: overflow visible
```

---

## External Dependencies

| Dependency | Version | CDN |
|---|---|---|
| Google Fonts | — | Inter (400-700), JetBrains Mono (400-600), Newsreader (400-700, italic) |
| Chart.js | 4.4.0 | `cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js` |
| Feather Icons | 4.29.1 | `cdn.jsdelivr.net/npm/feather-icons@4.29.1/dist/feather.min.js` |

---

*Aayuv DS v1.0 — The goal is always the same: make a complex, frightening number feel understandable, actionable, and human.*
