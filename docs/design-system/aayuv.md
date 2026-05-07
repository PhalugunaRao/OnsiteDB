# Aayuv DS — Design System Analysis

**Version:** 1.0 · 2026
**Type:** Single-file HTML design system documentation
**Stack:** HTML + CSS custom properties + Chart.js 4.4.0
**Fonts:** Google Fonts (Inter, Newsreader, JetBrains Mono)

---

## Overview

Aayuv DS is an **editorial-first design system** built for healthcare/biomarker data visualization. It draws aesthetic influence from data journalism (Bloomberg, NYT) rather than typical SaaS dashboards. The system prioritizes **trust, readability, and calm** over flashiness — treating health data presentation as a high-stakes communication challenge.

**Core stats:** 3 typefaces, 32+ colour tokens, 75+ components, 19 chart types, 7 design principles.

---

## 1. Design Principles

| # | Principle | Summary |
|---|-----------|---------|
| 01 | Clarity over complexity | If a chart needs explanation, redesign it. Every element must reduce cognitive load. |
| 02 | Narrative before numbers | Lead with the story/conclusion, then show evidence. Headlines before tables. |
| 03 | Trust through transparency | Every insight shows its source. Every prediction shows its confidence. |
| 04 | Calm visual language | Generous whitespace, restrained colour, quiet typography. Urgency via hierarchy, not saturation. |
| 05 | Scientific credibility | Closer to The Lancet than a fitness app. Clinical guidelines over lifestyle claims. |
| 06 | Progress over perfection | Show trends, not just values. A number moving in the right direction is the story. |
| 07 | Editorial rhythm | The page breathes like a long-form article. Data interrupts prose; prose contextualises data. |

---

## 2. Color System

### 2.1 Design Tokens (CSS Custom Properties)

The system uses a three-tier colour architecture:
1. **Brand colour** (`--brand: #2563EB`) — used for all UI chrome: section labels, kickers, active nav, CTA buttons, headline emphasis
2. **Semantic health colours** (named by meaning: `--health-optimal`, `--health-critical`, etc.)
3. **Short aliases** (`--rose`, `--green`, `--amber`, etc.) that map to the semantic layer — rose is reserved exclusively for health-critical signals, never for brand identity

### 2.2 Surface & Ink (Neutral Palette)

| Token | Hex | Role |
|-------|-----|------|
| `--paper` / `--neutral-white` | #FFFFFF | Primary background |
| `--paper-2` / `--neutral-50` | #F9FAFB | Secondary surface, sidebar bg |
| `--paper-3` / `--neutral-100` | #F3F4F6 | Tertiary surface, hover bg |
| `--paper-4` / `--neutral-200` | #E5E7EB | Dividers, input borders |
| `--ink` / `--neutral-900` | #0F1115 | Primary text, headlines |
| `--ink-2` / `--neutral-800` | #1C2026 | Secondary headings |
| `--ink-3` / `--neutral-600` | #4B5563 | Body text, descriptions |
| `--ink-4` / `--neutral-500` | #6B7280 | Muted text, placeholders |
| `--ink-5` / `--neutral-300` | #D1D5DB | Disabled text |

### 2.3 Semantic Health Colours

| Name | Primary | Dark | Light BG | Use |
|------|---------|------|----------|-----|
| **Rose** (Critical) | `#E8432C` | `#C43320` | `#FDEDEB` | Critical health alerts, risk signals, high-risk thresholds only |
| **Amber** (Attention) | `#D97706` | `#B45309` | `#FDF1E4` | Borderline biomarkers, "monitor" status |
| **Green** (Optimal) | `#14866D` | `#0E6354` | `#E6F3F0` | Optimal range, improving trend, resolved |
| **Blue** (Watch) | `#1D6FA4` | `#155B8A` | `#E8F1F6` | Informational, nutritional markers |
| **Purple** (Info) | `#7C3AED` | `#5B21B6` | `#F2EBFD` | Hormonal/neurological markers, longevity |

### 2.4 Brand Colours

| Token | Hex | Use |
|-------|-----|-----|
| `--brand` | `#2563EB` | **Primary brand blue** — section labels, kickers, active nav, CTA buttons, headline emphasis |
| `--brand-dk` | `#1D4ED8` | Brand hover/active states |
| `--brand-lt` | `#EFF6FF` | Brand light background (active sidebar, brand badge bg) |
| `--brand-m` | `rgba(37,99,235,0.1)` | Brand transparent overlay |
| `--brand-secondary` | `#1B4965` | Secondary navy |
| `--brand-accent` | `#7C3AED` | Accent purple |

> **Key change:** Brand identity (blue) is now fully separated from health-critical signalling (rose). Rose is reserved exclusively for risk/critical health states. This prevents cognitive confusion in health contexts where brand decoration could be mistaken for risk warnings.

### 2.5 Data Visualization Palette

8 dedicated viz tokens (`--viz-1` through `--viz-8`) covering primary line, secondary line, warning/critical thresholds, accent, neutral context, and highlights.

### 2.6 Colour Usage Rules

| Colour | Use for | Never use for |
|--------|---------|---------------|
| **Brand Blue** | Section labels, kickers, active states, CTA buttons, headline emphasis | Health status signalling, decorative fills, data viz |
| Rose | Critical health alerts, risk signals, high-risk thresholds | Brand identity, generic success, decorative fills |
| Amber | Borderline biomarkers, monitor status, action cues | Positive outcomes, background surfaces |
| Green | Optimal ranges, improving trends, resolved alerts | Neutral/informational content, decorative use |
| Blue | Informational notes, nutritional markers | Risk communication, primary actions |
| Purple | Hormonal markers, longevity metrics | Primary actions, critical health alerts |

---

## 3. Typography

### 3.1 Typography Rules

| Typeface | CSS Class | Use For | Never Use For |
|----------|-----------|---------|---------------|
| **Newsreader** (serif) | `.display`, `.serif` | Super titles & main section headings ONLY — hero headlines, section titles, pull quotes | Body text, card titles, subtitles, descriptions, labels |
| **Inter** (sans-serif) | `.sans` (default) | Titles, subtitles, body text, descriptions, labels, buttons, card headings, all UI text | Main section headings, numeric values |
| **JetBrains Mono** (monospace) | `.mono`, `.nums` | ALL numbers — biomarker values, scores, percentages, dates, stat callouts, tokens, code | Headings, body text, labels, buttons |

> **Rule:** Every number in the system uses JetBrains Mono (`font-variant-numeric: tabular-nums; font-family: 'JetBrains Mono', monospace`). This includes: biomarker values (114 mg/dL), percentages (↓ 11.6%), scores (82/100), dates (Mar 2026), stat callouts (−38%), gauge values, chart axis labels, table numeric columns, stepper values, ranges (70–99 mg/dL), protocol dosages (4,000 IU), and any other numeric data. In Tailwind, use the `font-mono` utility class. In `FilterSortTable`, set `mono: true` on column definitions for numeric columns. Newsreader is restricted to the highest-level display headings and editorial pull quotes. Inter is the workhorse for everything else.

### 3.2 Type Scale

| Token | Size | Weight | Typeface | Line Height | Use |
|-------|------|--------|----------|-------------|-----|
| `--ts-5xl` | 68px | 700 | **Newsreader** | 1.02 | Hero headline, landing title |
| `--ts-4xl` | 52px | 700 | **Newsreader** | 1.08 | Chapter headline (super heading) |
| `--ts-3xl` | 38px | 700 | **Newsreader** | 1.12 | Section title, report header |
| `--ts-2xl` | 28px | 700 | **Inter** | 1.2 | Card heading, subheadline |
| `--ts-xl` | 21px | 600 | **Inter** | 1.3 | UI headline, modal title |
| `--ts-lg` | 17px | 400 | **Inter** | 1.75 | Body text, descriptions |
| `--ts-md` | 15px | 400 | **Inter** | 1.6 | Card body, secondary text |
| `--ts-sm` | 13px | 500 | **Inter** | 1.5 | Labels, table cells, nav links |
| `--ts-xs` | 11px | 600 | **Inter** | — | Kicker/label, section tag (uppercase) |
| `--ts-2xs` | 10px | — | **Inter** | — | Smallest utility size |
| (numbers) | any | 600–700 | **JetBrains Mono** (`font-mono`) | 1 | ALL numeric values: biomarker values, scores, percentages, dates, stat callouts, ranges, dosages, axis labels, gauge values, stepper values. Use `font-mono` in Tailwind, `mono: true` on FilterSortTable columns |

**Key change from original DS6:** `--ts-2xl` (card headings) moved from Newsreader to Inter. `--ts-lg` (body) moved from Newsreader to Inter. All stat/callout numbers moved from Newsreader to JetBrains Mono.

---

## 4. Spacing & Grid

### 4.1 Spacing Scale (4px base unit)

| Token | Value | Use |
|-------|-------|-----|
| `--sp-1` | 4px | Icon gap, tight label spacing |
| `--sp-2` | 8px | Badge padding, chip gap |
| `--sp-3` | 12px | Inline element gap, tight list |
| `--sp-4` | 16px | Card padding small, grid gap |
| `--sp-5` | 20px | Paragraph spacing |
| `--sp-6` | 24px | Card padding standard, section gap small |
| `--sp-7` | 32px | Card padding large, between components |
| `--sp-8` | 40px | Section header spacing |
| `--sp-9` | 56px | Section divider, article rhythm |
| `--sp-10` | 72px | Section padding, hero spacing |

### 4.2 Layout Grid

| Layout | Max Width | Use |
|--------|-----------|-----|
| Prose | 780px | Long-form prose, pull quotes, callouts, inline charts |
| Wide | 1040px | Chart blocks, biomarker tables, risk tables, hero stats |
| 2-Column | 1fr 1fr | Dual charts |
| 3-Column | 1fr 1fr 1fr | Scores / stats |
| 4-Column | 1fr 1fr 1fr 1fr | Hero stats |

### 4.3 Sidebar

Fixed width: `240px`, sticky, with scroll.

---

## 5. Elevation & Shadow

### 5.1 Shadow Scale

| Token | Value | Use |
|-------|-------|-----|
| `--sh-sm` | `0 1px 3px rgba(15,17,21,0.05)` | Badges, subtle card lift |
| `--sh-md` | `0 4px 6px -1px rgba(15,17,21,0.05), 0 2px 4px -2px rgba(15,17,21,0.05)` | Hovered cards, dropdowns |
| `--sh-lg` | `0 10px 15px -3px rgba(15,17,21,0.05), 0 4px 6px -4px rgba(15,17,21,0.05)` | Tooltips, popovers |
| `--sh-xl` | `0 20px 25px -5px rgba(15,17,21,0.05), 0 8px 10px -6px rgba(15,17,21,0.05)` | Modals, overlays |

### 5.2 Border Radius Scale

| Token | Value | Use |
|-------|-------|-----|
| `--r-sm` | 6px | Small elements |
| `--r-md` | 10px | Buttons, inputs, tooltips |
| `--r-lg` | 14px | Standard cards, containers |
| `--r-xl` | 20px | Insight cards, large panels |
| `--r-pill` | 999px | Badges, pills, tags |

---

## 6. Components

### 6.1 Badges & Tags

- **Health status badges:** `.badge` with variants `.badge-ok`, `.badge-warn`, `.badge-risk`, `.badge-info`, `.badge-purple`, `.badge-neutral`
- **Pill tags:** `.ic-tag-pill` — used for chapter/insight categorization
- **Kicker labels:** `.kicker` — uppercase label with left rule line in brand blue, used for section/chapter headings

### 6.2 Buttons & Actions

#### 6.2.1 Button Hierarchy (6 Variants)

| Variant | Class | Background | Text | Use |
|---------|-------|------------|------|-----|
| **Primary** | `.btn-primary` | `--n-900` | white | Highest emphasis — single most important action per view |
| **Secondary** | `.btn-secondary` | `--n-0` (white) | `--n-900` | Supporting actions — border-based, no fill |
| **Tertiary** | `.btn-tertiary` | transparent | `--n-600` | Lowest emphasis — no border/fill until hover |
| **Brand** | `.btn-brand` | `--brand` (#2563EB) | white | CTA / marketing pages — brand blue fill |
| **Danger** | `.btn-danger` | `--rose` (#E8432C) | white | Destructive actions — always with confirmation dialog |
| **Link** | `.btn-link` | transparent | `--brand` | Inline text actions — underline border, no fill |

**Inline CTA:** `.ic-cta` — semantic colour link used inside insight cards (brand, green, amber, purple variants)

#### 6.2.2 Sizes

| Size | Class | Padding | Font |
|------|-------|---------|------|
| Small | `.btn-sm` | 7px 14px | 12px |
| Default | (base) | 10px 20px | 13px |
| Large | `.btn-lg` | 13px 26px | 15px |
| Icon | `.btn-icon` | 9px square | — |

#### 6.2.3 Icon Buttons & Pill

| Shape | Class | Description |
|-------|-------|-------------|
| **Icon — Square** | `.btn-icon` | Equal padding (9px), no text. Sizes: sm (6px), lg (12px) |
| **Icon — Circle** | `.btn-icon-circle` | Round `border-radius: 50%`. For FABs, floating actions |
| **Icon + Text** | (base `.btn`) | Leading icon (↓ Download) or trailing icon (Get Started →) |
| **Pill** | `.btn-pill` | `border-radius: var(--r-pill)` (999px). For filters, chips, tags |
| **Pill + Icon** | `.btn-pill` | Chip-style with dismiss (✕) or add (+) actions |

#### 6.2.4 Disabled & Button Spinner

| State | Behavior |
|-------|----------|
| **Disabled** | Primary: `--n-300` bg. Secondary/Tertiary: `--n-400` text. Brand/Danger: 45% opacity. All: `cursor: not-allowed`, `pointer-events: none` |
| **Button Spinner — Icon only** | Text hidden (`color: transparent`), centered spinner overlay. White spinner on dark fills, dark spinner on light fills. `pointer-events: none` |
| **Button Spinner — With text** | Spinner inline left of visible label text. `opacity: 0.85`, `pointer-events: none`. Use for async actions where the user needs context (e.g. "Saving…") |

#### 6.2.5 Hover & Focus States

| State | Behavior |
|-------|----------|
| **Hover** | Primary/Brand/Danger: darken bg + shadow lift `0 2px 8px`. Secondary: subtle bg + border darken. Tertiary: reveal bg. Link: darken text + solidify underline |
| **Active** | `scale(0.97)` press feedback on all filled variants |
| **Focus** | `2px solid --brand` outline with `2px` offset. `:focus-visible` only (keyboard navigation, not mouse) |

#### 6.2.6 Button Combinations

| Pattern | Layout |
|---------|--------|
| Dialog actions | `[Tertiary: Cancel]` `[Primary: Confirm]` — primary right-most |
| Destructive confirmation | `[Secondary: Keep Account]` `[Danger: Delete Permanently]` |
| Split actions | `[Brand LG: Download]` `[Secondary LG: Share]` `[Link: Print version]` |

#### 6.2.7 Specification

- **Border radius:** `--r-md` (10px) default, `--r-pill` (999px) for pill, `50%` for circle icons
- **Transition:** `all .2s cubic-bezier(.22, 1, .36, 1)` — spring ease-out
- **Font:** Inter, 500 weight
- **Gap:** 8px (default), 6px (sm), 10px (lg)

### 6.3 Cards & Containers

| Variant | Class/Component | Description |
|---------|----------------|-------------|
| Default | `.ds-card` / `ds-card` | Border + paper bg, hover lift + shadow |
| Elevated | `.ds-card.elevated` | Pre-applied shadow |
| Tinted | `.ds-card.bg-tinted` | Paper-2 background |
| Left-border Rose | `.ds-card.bordered-rose` | 3px rose left border — critical/action-required items |
| Left-border Amber | `.ds-card.bordered-amber` | 3px amber left border — borderline values |
| Left-border Green | `.ds-card.bordered-green` | 3px green left border — resolved/optimal |
| CTA Card | `CTACard` | Title + subtitle + brand CTA + optional secondary CTA button |
| Image Card | `ImageCard` | 16:9 image header + title + subtitle + CTA |
| Icon Chevron Card | `IconChevronCard` | Icon + title + subtitle + right chevron — navigation card |
| Icon Chevron Colored | `IconChevronCardColored` | Same with semantic-coloured icon background |
| Toggle Card | `ToggleCard` | Title + subtitle + interactive toggle switch |
| Featured Card | `FeaturedCard` | Brand gradient header + badge + title + dual CTAs |
| Pricing Card | `PricingCard` | Plan name + price + feature list + CTA, optional highlight ring |

**Stat Callout:** `.stat-callout` — left-bordered callout for anchoring key numbers in article flow.

**Pull Quote:** `.pull-quote` — serif italic text with top/bottom borders, for clinical authority quotes.

### 6.4 Forms & Inputs

#### 6.4.1 Base Inputs
- `.ds-input` — Full-width input with subtle border, activates on focus (`border-color → --ink`)
- `.ds-label` — Small uppercase label above inputs
- Error state: `border-color → --rose` + error message below
- Success state: `border-color → --green` (optional)
- Supports text, email, tel, number, date, select, and textarea

#### 6.4.2 Additional Form Components

| Component | Description |
|-----------|-------------|
| `FormField` | Reusable label + error wrapper for any input |
| `SearchInput` | Icon-prefixed search with clear button, focus border activation |
| `Checkbox` | Multi-select checkbox with checkmark, supports disabled state |
| `RadioGroup` | Single-select radio with optional description per option |
| `Toggle` | Switch toggle — default and small sizes, brand blue when on, neutral when off |
| `NumberStepper` | Increment/decrement buttons with min/max bounds, mono number display, optional unit label |
| `FileUpload` | Drag-and-drop zone with typed icon (e.g. PDF=FileScan, CSV=FileSpreadsheet), file preview with size after selection, green progress bar, remove button |
| `CopyInput` | Read-only input with clipboard copy button, shows "Copied" confirmation |

### 6.5 Tables

`.ds-table` — Minimal table with uppercase column headers, subtle row dividers, hover row highlight.

`FilterSortTable` — Interactive table with text search, column sorting (asc/desc), column-level filter dropdowns with checkboxes, active filter chips displayed above table, row count, and empty state. Supports `initialFilters` prop for pre-applied filter chips. Column config supports `mono: true` for JetBrains Mono on numeric data columns (value, range, trend).

### 6.6 Tooltip

`.ds-tooltip-box` — Dark background (ink), warm shadow, pointer arrow, monospace label + bold value.

### 6.7 List Cells

Flexible list cell components for settings, menus, biomarker rows, and grouped content.

| Variant | Component | Trailing Element | Use Case |
|---------|-----------|------------------|----------|
| Basic | `ListCell` | Custom trailing slot | Settings, simple lists, menus |
| Badge | `ListCellBadge` | Status badge (ok/warn/risk/info/purple/brand) | Biomarker results, protocol status |
| Chips | `ListCellChips` | Coloured chip tags below subtitle | Categorized items, multi-tag content |
| CTA | `ListCellCTA` | Action button (brand/primary/secondary/danger) | Pending tasks, quick actions |
| Date | `ListCellDate` | Date above title + optional trailing | Lab history, timelines, upcoming events |
| Accordion | `ListCellAccordion` | Chevron toggle | Expandable details, FAQ, biomarker info |
| Accordion Nav | `ListCellAccordionNav` | Chevron + page link on expand | Report summaries, expand → open page |
| Navigation | `ListCellNav` | Chevron right (opens slide panel) | Drill-down menus, report lists |

**ListGroup** — Container with rounded border + optional uppercase header label. All cells support optional icon or text-only (no icon) layouts.

**Toggle Sections** — `ToggleSection` — Row-style toggle with title + subtitle, used inside ListGroup for grouped settings (e.g. notification preferences, privacy settings). All toggles are interactive.

### 6.8 Icon Grids

Grid layouts for category navigation, feature showcases, and icon-labelled menus.

| Variant | Component | Description |
|---------|-----------|-------------|
| Basic Grid | `IconGrid` | Wrapper for 3-column or 4-column icon grids |
| Grid Item | `IconGridItem` | Icon + 2-line label, optional coloured icon bg, optional click handler |
| Grid Card | `IconGridCard` | Fixed-size card (343×284 for 3×3, 343×300 for 4×3) with title header + icon grid content |

Icon grids support both neutral (gray) and semantic-coloured icon backgrounds. Labels use `whitespace-pre-line` for 2-line display.

### 6.9 Navigation Components

| Component | Description |
|-----------|-------------|
| `Breadcrumbs` | Horizontal breadcrumb trail with chevron separators. Last item is active (bold). Links hover to brand colour. |
| `TabsUnderline` | Page-level section navigation. Animated underline indicator with spring easing. Content swap on click. |
| `TabsPill` | In-context filters/category switching. Rounded pill background with shadow lift. Compact variant. |
| `Pagination` | Numbered page buttons with prev/next arrows. Ellipsis for large ranges. Active page = neutral-900 fill. Mono numbers. Disabled state on first/last. |

### 6.10 Modals & Overlays

| Component | Description |
|-----------|-------------|
| `Modal` | Centered dialog with backdrop blur. Header (title + X close), body, and footer. max-width 480px. `animate-[dropIn]` entrance. Close on backdrop click or X button. |
| `SlidePanel` | Right-edge drawer (width 440px). Header (title + X close), scrollable body. Slides in from right with `translateX` transition. Backdrop click to close. Used for detail views and list cell drill-downs. |

---

## 7. Data Visualization

### 7.1 Chart Categories (19 chart types)

#### A. Line & Area Charts

| Chart | Use Case |
|-------|----------|
| **Area Trend** | Single biomarker trend, health score history. Gradient fill confirms direction |
| **Multi-Series Line** | Comparing 2–3 related biomarkers over time (e.g. HDL vs LDL). Solid vs dashed to differentiate |
| **Stepped Line** | Discrete value changes — medication dosage, protocol switches, lab thresholds |

#### B. Bar Charts

| Chart | Use Case |
|-------|----------|
| **Stacked Bar** | Composition breakdown — sleep staging, macro splits, activity distribution |
| **Horizontal Bar** | Ranked comparisons — risk factors, category scores, nutrient intake |
| **Grouped Bar** | Side-by-side comparison across time periods. Max 3 categories |

#### C. Circular Charts

| Chart | Use Case |
|-------|----------|
| **Doughnut / Ring** | Category breakdown, status distribution. 65% cutout, white stroke |
| **Polar Area** | Weighted category scores. Segment radius = score, equal angles |
| **Radar / Spider** | Multi-domain health overview. Max 2 series (current + previous), 6–8 axes |

#### D. Gauges & Meters

| Chart | Use Case |
|-------|----------|
| **Health Score Gauge** | Semi-circle arc, score 0–100, single colour fill |
| **Multi-Zone Risk Gauge** | Green/amber/rose arc zones with needle indicator (e.g. CVD risk) |
| **Linear Meters** | Horizontal fill bar with optimal zone overlay and range labels |

#### E. Scatter & Bubble

| Chart | Use Case |
|-------|----------|
| **Scatter Plot** | Biomarker correlations. Colour = risk group, max 3 groups |
| **Bubble Chart** | 3-variable visualization: x = modifiability, y = impact, radius = urgency |

#### F. Heatmaps & Matrices

| Chart | Use Case |
|-------|----------|
| **Activity Heatmap** | Weekly grid — rows = metrics (Sleep/Steps/HRV/Stress), columns = days. Opacity encodes intensity |
| **Correlation Matrix** | 5×5 biomarker grid with Pearson r-values. Green = inverse, Rose = positive, opacity = strength |

#### G. Specialized Charts

| Chart | Use Case |
|-------|----------|
| **Inline Sparklines** | 120×24px micro-charts. No axes, no labels — trend direction only |
| **Waterfall** | Health score contribution breakdown: Base → Diet → Exercise → Sleep → Stress → Total |

### 7.2 Chart Design Rules

| Rule | Specification | Rationale |
|------|---------------|-----------|
| Background | `var(--paper)` or `var(--paper-2)` | Charts live inside paper-toned containers |
| Grid lines | Horizontal only, `rgba(0,0,0,.05)` | Vertical gridlines create visual noise |
| Axis labels | JetBrains Mono, 10–11px, `--n-400` (#9CA3AF) | Monospace enforces numeric alignment. Lighter than body text for visual hierarchy. Category labels use `--n-600` (#4B5563) |
| Line weight | 2–2.5px stroke | Lightweight preserves editorial quietness |
| Area fill | 12–18% opacity gradient | Confirms direction without dominating |
| Data points | 4px radius, white border, 2px | Visible on hover, not overwhelming |
| Colour usage | One semantic colour per chart | Multi-colour requires legend overhead |
| Tooltip bg | `var(--ink)` · 8px radius · `--sh-lg` | Dark tooltip against light paper |
| Heatmap opacity | 15%–90% of semantic colour | Opacity encodes intensity, not hue |
| Gauge arcs | Semi-circle · 10px stroke · round cap | Clean arc, no tick marks |
| Sparklines | 120×24px · no axes · 1.5px stroke | Inline trend indicator, not a chart |
| Matrix cells | Green = inverse · Rose = positive | Consistent with health colour semantics |

### 7.3 Chart UI Elements

- **Tooltip:** Dark bg (`#0F1115`), 8px corner radius, JetBrains Mono, pointer arrow
- **Reference Lines:** Solid green (optimal), dashed amber (borderline), dashed rose (high-risk)
- **Viz Palette:** 8 tokens (`--viz-1` through `--viz-8`) — never more than 3 in one chart
- **Legend:** Below chart or inline with title. Never inside chart area
- **Font:** Inter for labels, JetBrains Mono for axis values (fill: `#9CA3AF` / `--n-400`)

### 7.4 Data Tables

- **Biomarker Summary Table:** Current, Previous, Change (with trend arrows), Optimal Range, Status badge per biomarker
- **Risk Factor Table:** Factor name, inline gradient progress bar, percentage weight

---

## 8. Patterns

### 8.1 Editorial / Chapter Structure

**Flow:** Kicker → Display headline (with italic emphasis) → Body prose → Pull quote → Chart

This mirrors long-form data journalism — data interrupts prose, prose contextualises data.

### 8.2 Avatars

| Component | Description |
|-----------|-------------|
| `Avatar` | Circular avatar with initials fallback (hue derived from name hash for consistency). Sizes: xs (24), sm (32), md (40), lg (48), xl (64). Optional status indicator: online (green), away (amber), busy (rose), offline (gray). |
| `AvatarGroup` | Stacked avatars with -2.5px overlap, white ring border, and +N overflow counter. Configurable `max` prop. |

### 8.3 Employee Health Profiles

| Component | Description |
|-----------|-------------|
| `EmployeeHealthCard` | Card-based employee health summary: avatar, name, role, department, health score (mono), risk level badge (low/moderate/high), flag count, and biomarker status tags. Hover lift. |
| `EmployeeHealthRow` | Row-based variant for table layouts: avatar, name, role, tags, risk badge, flag count, health score, and chevron for drill-down. Used inside `ListGroup` containers. |

### 8.4 Skeleton Loaders

Placeholder shimmer states (`animate-pulse` with `bg-neutral-200`) that mirror final layout structure. Prevents layout shift.

| Component | Description |
|-----------|-------------|
| `Skeleton` | Base primitive — rounded rectangle, accepts className + style. |
| `SkeletonCard` | Card shape: avatar circle, text lines, badge pills. |
| `SkeletonRow` | Row shape: avatar, text lines, badges, score. |
| `SkeletonChart` | Chart shape: title, subtitle, bar chart columns at varied heights. |
| `SkeletonTable` | Table shape: header row + configurable number of body rows. |

### 8.5 Empty States

Zero-data views with centered icon illustration, title, description, and CTA buttons for first-time experiences.

`EmptyState` — Accepts `icon` (LucideIcon), `title`, `description`, optional `ctaLabel` + `onCta`, optional `secondaryLabel` + `onSecondary`.

Variants demonstrated:
- **First-time:** No lab results, no device connected, no protocols, no reports, no documents
- **Search/filter:** No results found, inbox zero
- **Completion:** All markers optimal, onboarding complete

### 8.6 Stepper Progress

| Component | Description |
|-----------|-------------|
| `StepperProgress` | Horizontal step indicator with numbered circles, connector lines, labels, and optional descriptions. Completed steps show checkmark in brand blue; current step has brand border; future steps are neutral. |
| `StepperVertical` | Vertical variant for process flows (e.g. lab processing pipeline). Same visual language as horizontal. |

### 8.7 Timeline Patterns

`.tl-item` with dot + connecting line. Each item has a coloured dot (status), date, headline, and description text.

| Variant | Use Case | Icon Examples |
|---------|----------|---------------|
| **Treatment Progress** | Monthly report findings, resolved/monitoring/in-progress items | ✓ (green), ◎ (amber), ↓ (purple) |
| **Protocol Timeline** | Supplement & intervention history, dosage changes | + (brand), ↑ (green), △ (amber), ★ (green) |

Timelines are displayed side-by-side for comparison. Each dot uses semantic health colours with a 1.5px border and light background fill. A connecting vertical line runs between items.

### 8.3 Biomarker UI (10 Patterns)

| # | Pattern | Description | Data Requirements |
|---|---------|-------------|-------------------|
| 1 | **Range Row** | Name + category, range bar with optimal zone + thumb, current value, Δ%, status badge | Value, unit, optimal range, status |
| 2 | **Score Ring** | SVG circular score indicator. 120px overall, 64px per category. Stroke colour = health status | Score 0–100, category label |
| 3 | **Detail Card** | Full biomarker card: large mono value, inline SVG sparkline, target threshold line, range bar, test date, guideline source | Value + trend + range + history + source |
| 4 | **Progress Bar** | `.prog-track` (5px, neutral bg) + `.prog-fill` (gradient from 50% opacity to full). Used for system health categories | Score, category name, status label |
| 5 | **Lab History** | Longitudinal table: date, inline range position mini-bar, value, Δ delta, lab source per row | Date + value + delta + source per entry |
| 6 | **Correlation Panel** | Correlation bar for related markers. Bar width = |r| strength. Colour = positive (rose/amber) vs inverse (green/blue). Pearson r coefficient | Correlation coefficient, direction, strength |
| 7 | **Multi-Zone Range** | 4-zone clinical classification strip (e.g. Optimal/Near-Optimal/Borderline/High) with positioned thumb and zone labels | Zone boundaries, zone labels, current value |
| 8 | **Biological Age** | Chronological vs biological age comparison. Newsreader display numbers. Supporting longevity sub-markers (Telomere, DNA Methylation, GlycanAge, DunedinPACE) | Chrono age, bio age, supporting markers |
| 9 | **Protocol Tracker** | Supplement management table: name, dosage (monospace), timing, duration, target marker badge | Name, dosage, timing, target marker |
| 10 | **Before/After** | Compact comparison card: old (line-through) → new (bold) with % change and outcome label | Previous value, current value, % change |

### 8.4 Insight Cards

`.insight-card` — Follows the editorial pattern: **Context → Insight → Evidence → Recommendation**.

Structure: Tag pill → Newsreader headline → Serif body prose → Underline CTA link.
Interaction: Hover lift + shadow. Never leads with recommendation — data speaks first.

Four semantic variants: Positive Signal (green), Action Required (amber), Resolved (blue), Improving (purple).

### 8.5 Risk Rows

`.risk-item` — Grid layout with label, bar track with fill, and percentage value. Used for risk factor breakdowns.

---

## 9. Motion & Animation

### 9.1 Easing Curves

| Name | Curve | Use |
|------|-------|-----|
| Ease-out / Spring | `cubic-bezier(.22,1,.36,1)` | Card lifts, slide-up reveals, score rings — snappy start, gentle landing |
| Ease-in-out / Smooth | `cubic-bezier(.4,0,.2,1)` | Progress bar fills, chart draws, sidebar nav — balanced, symmetrical |
| Overshoot / Bounce | `cubic-bezier(.34,1.56,.64,1)` | Score ring completion, bio-age counter — single moment of delight |

### 9.2 Animation Inventory

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Page section reveal | 650ms | `.22,1,.36,1` | IntersectionObserver, 8% threshold |
| Score ring draw | 1400ms | `.22,1,.36,1` | Page load, 200ms delay |
| Counter (number roll) | 1200ms | Linear step (16ms) | Page load, 400ms delay |
| Progress bar fill | 1200ms | `.22,1,.36,1` | IntersectionObserver |
| Card hover lift | 200ms | ease | mouseenter |
| Modal open | 300ms | `.22,1,.36,1` | click |
| Insight expand | 350ms | `.22,1,.36,1` | click, max-height transition |
| Tooltip | 150ms | ease | mouseenter / data point hover |

### 9.3 Reduced Motion

Respects `prefers-reduced-motion: reduce` — all CSS animation and transition durations set to `0.01ms`.

---

## 10. Voice & Tone

### 10.1 Writing Style

Writes like **the best health journalist** — not a clinician, not a wellness influencer. Precise, empathetic, direct. Never alarmist, never dismissive.

### 10.2 Principles

| Principle | Means | Example |
|-----------|-------|---------|
| Lead with meaning | Tell user what data means, then show number | "Your body is ageing 4 years slower than average." |
| Name the trend | Describe direction, not just current value | "LDL has decreased 23% over 12 months" |
| Clinical, not clinical-feeling | Correct terminology explained in prose | "HbA1c — a 3-month average of your blood glucose" |
| Show the evidence chain | Always cite guideline source | "AHA/ACC Guideline threshold: <100 mg/dL" |
| No false urgency | Reserve rose/red for genuinely critical health signals | Amber for "monitor", Rose only for "critical" — brand blue for UI chrome |

### 10.3 Do / Don't

**Do:** "Your LDL has decreased 23% over 12 months — a meaningful shift driven by specific, identifiable changes."

**Don't:** "Your cholesterol is HIGH! You need to take action immediately!" or "Great work! You're on your health journey! Keep it up!"

---

## 11. Accessibility

### 11.1 Colour Contrast

| Pair | Ratio | Status |
|------|-------|--------|
| Ink on Paper | 17.9:1 | Pass |
| Brand Blue on Paper | 4.6:1 | Pass |
| Rose on Paper | 4.8:1 | Pass |
| Green on Paper | 4.6:1 | Pass |
| Amber on Paper | 3.1:1 | Use with icon |

### 11.2 Rules

| Rule | Standard |
|------|----------|
| Body text minimum | 13px / 0.8125rem |
| Interactive target | 44x44px minimum |
| Focus indicators | 2px outline, brand blue colour |
| Reading line length | Max 75 chars (780px prose) |
| Chart annotations | Always text-labelled reference lines |
| Animation respect | `prefers-reduced-motion` pauses all CSS animations |
| Colour-blindness | Never use colour alone — always pair with icon/symbol + text label |
| Multi-series charts | Must use colour + shape (solid/dashed lines, circle/square dots) |

---

## 12. Architecture Notes

### 12.1 File Structure

Two implementations:

**HTML version** (`DS6-reference.html`):
- Single self-contained HTML file with full component parity
- Inline `<style>` block (~650+ lines of CSS)
- Inline `<script>` block (~250 lines of JS)
- External: Google Fonts CDN, Chart.js 4.4.0 CDN
- All components: list cells, icon grids, toggles, card variants, advanced forms, navigation (tabs, pagination, breadcrumbs), modals/panels, avatars, health profiles, skeletons, empty states, steppers
- 11 Chart.js instances (area, multi-line, stepped, stacked bar, h-bar, grouped, radar, doughnut, polar, scatter, bubble)

**React version** (`src/app/design-system/`):
- Next.js 16 + Tailwind v4 + Recharts
- `components.tsx` — 60+ reusable Tailwind components (cards, list cells, toggles, form controls, icon grids, modals, slide panels)
- `page.tsx` — full design system page with interactive demos (toggles, checkboxes, radios, steppers, file uploads, slide panels on list cell click)
- `globals.css` — DS6 tokens via `@theme inline`
- Fonts: Inter, JetBrains Mono (next/font), Newsreader (Google Fonts CDN)

### 12.2 CSS Architecture

- **Design tokens** as CSS custom properties on `:root` (DS6-prefixed: `--ds-brand`, `--ds-rose`, etc.)
- **Tailwind v4** `@theme inline` maps tokens to utility classes (`text-ds-brand`, `bg-ds-rose-lt`)
- **BEM-lite** class naming in HTML version (`.ds-card`, `.ic-tag-pill`, `.comp-preview`)
- Component classes are flat, not deeply nested
- Responsive: mobile breakpoint at 720px (sidebar collapses, padding reduces)
- Print: sidebar hidden, main content overflow visible

### 12.3 JavaScript

- **Sidebar active state:** IntersectionObserver tracks visible sections, toggles `.active` on sidebar links
- **Chart.js instances (HTML):** 11 demo charts with consistent theming (dark tooltip, monospace axes `#9CA3AF`, paper bg)
- **Recharts (React):** 19 chart types with same design language (area, multi-line, stepped, stacked bar, h-bar with multi-colour, grouped bar, radar, doughnut, polar area (custom SVG), scatter, bubble, gauges (SVG), linear meters, heatmap, correlation matrix, sparklines (SVG), waterfall)
- **Reduced motion:** Runtime check disables all transitions/animations

### 12.4 Layout

```
┌──────────┬─────────────────────────────────┐
│ Sidebar  │  Topbar (sticky)                │
│ (240px)  ├─────────────────────────────────┤
│ sticky   │  Hero                           │
│          ├─────────────────────────────────┤
│ nav      │  Sections (max-width: 1040px)   │
│ links    │  01 Principles                  │
│          │  02 Color                       │
│          │  03 Typography                  │
│          │  04 Spacing                     │
│          │  ...                            │
│          │  17 Token Reference             │
└──────────┴─────────────────────────────────┘
```

---

## 13. Key Token Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--paper` | #FFFFFF | Primary background surface |
| `--ink` | #0F1115 | Primary text, headlines |
| `--ink-3` | #4B5563 | Secondary body text |
| `--brand` | #2563EB | Primary brand blue, section labels, kickers, CTA |
| `--rose` | #E8432C | Critical health alerts, risk signals only |
| `--amber` | #D97706 | Borderline, monitor status |
| `--green` | #14866D | Optimal, improving, resolved |
| `--blue` | #1D6FA4 | Informational, nutritional |
| `--purple` | #7C3AED | Hormonal, longevity |
| `--rule` | #E5E7EB | Borders, dividers |
| `--ts-5xl` | 68px | Hero headlines |
| `--ts-lg` | 17px | Body prose |
| `--ts-sm` | 13px | UI labels, table cells |
| `--sp-6` | 24px | Standard card padding |
| `--sp-9` | 56px | Section rhythm |
| `--r-lg` | 14px | Standard card radius |
| `--sh-md` | subtle | Hovered card elevation |

---

## 14. Design System Summary

> The goal is always the same: make a complex, frightening number feel understandable, actionable, and human.

Every token, typeface, and interaction pattern was chosen not because it looks beautiful — but because it makes health data feel trustworthy. The design disappears. The insight remains.
