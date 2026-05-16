# mobile-responsive-ux - Plan Document

> Version: 1.0.0 | Date: 2026-05-16 | Status: Draft
> Level: Starter

## 1. Overview

### 1.1 Purpose
Improve the mobile-only user experience for the portfolio without changing desktop layout, motion, or interaction behavior.

### 1.2 Background
The current UI is primarily a desktop horizontal canvas compressed into mobile. Review findings identified mobile overlap risk, missing progress or drag guidance, touch gesture ambiguity, hover-only gallery/contact interactions, and dense detail-page layout.

## 2. Goals

### 2.1 Primary Goals
- [ ] Add mobile-only layout refinements for the landing, gallery, detail, and contact sections.
- [ ] Improve touch scrolling predictability without changing desktop wheel or mouse behavior.
- [ ] Keep all desktop `md:` and larger layouts visually unchanged.

### 2.2 Non-Goals
- Redesign the desktop experience.
- Change gallery data, admin behavior, routing, or backend integration.
- Replace the horizontal storytelling concept.

## 3. Scope

### 3.1 In Scope
- Mobile-only Tailwind class changes in existing components.
- Touch gesture axis handling for mobile.
- Mobile-only visibility and placement changes for guidance, gallery metadata, detail metadata, and contact links.

### 3.2 Out of Scope
- New pages, new dependencies, or new animation libraries.
- Desktop layout or behavior changes.

## 4. Success Criteria

- [ ] Mobile landing content avoids obvious overlap on small screens.
- [ ] Mobile users see a clear drag/explore hint and progress context.
- [ ] Touch scrolling responds primarily to horizontal intent.
- [ ] Gallery and contact sections expose usable information without hover.
- [ ] Detail page prioritizes the image and keeps metadata readable on mobile.
- [ ] Production build succeeds.

## 5. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Desktop regression | High | Medium | Use mobile defaults plus explicit `md:` restore classes. |
| Mobile composition drift | Medium | Medium | Keep changes scoped to spacing, visibility, and sizing. |
| Touch behavior feels too constrained | Medium | Low | Use axis threshold only after gesture intent is clear. |

## 6. References

- `src/app/App.tsx`
- `src/app/components/LandingPages.tsx`
- `src/app/components/GalleryItem.tsx`
- `src/app/components/ContactPanel.tsx`
