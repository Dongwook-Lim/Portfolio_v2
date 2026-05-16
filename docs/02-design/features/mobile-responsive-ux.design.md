# mobile-responsive-ux - Design Document

> Version: 1.0.0 | Date: 2026-05-16 | Status: Draft
> Level: Starter | Plan: docs/01-plan/features/mobile-responsive-ux.plan.md

## 1. Overview

This feature refines the portfolio's mobile UX while preserving the desktop experience. The implementation uses mobile-first Tailwind defaults with explicit `md:` restore classes where an existing desktop value must remain unchanged.

## 2. Page Structure

- Landing panels: keep horizontal storytelling, but reduce mobile overlap and restore a small mobile drag hint.
- Gallery strip: improve mobile touch targets and expose title/location without hover.
- Detail overlay: prioritize the artwork on mobile, reduce background text noise, and make metadata compact.
- Contact panel: provide mobile-visible links and remove reliance on hover-only discovery.

## 3. Design

### 3.1 Layout

- Desktop (`md` and up): preserve current layout, widths, timings, and positions.
- Mobile (`< md`): adjust absolute positions, widths, and visibility only where the current compressed desktop composition causes overlap or hidden affordances.
- Detail mobile layout keeps navigation arrows but shifts information into a readable bottom strip.

### 3.2 Styling

- Reuse current fonts, colors, and motion curves.
- Avoid new dependencies.
- Prefer `hidden md:*`, `md:hidden`, and mobile default classes over custom media queries.

## 4. Components

- `Gallery` in `src/app/App.tsx`
- `LandingPages` in `src/app/components/LandingPages.tsx`
- `GalleryItem` in `src/app/components/GalleryItem.tsx`
- `ContactPanel` in `src/app/components/ContactPanel.tsx`

## 5. Interaction Design

- Touch scroll uses axis intent so horizontal movement drives the gallery and mostly vertical movement does not unexpectedly advance the horizontal canvas.
- Mobile hints are visible without hover.
- Contact information is directly tappable on mobile.

## 6. Implementation Order

1. Add mobile-only drag/progress hint and touch axis handling.
2. Adjust mobile landing panel placement.
3. Improve mobile gallery cards and metadata.
4. Compact mobile detail overlay.
5. Add mobile contact links and verify build.
