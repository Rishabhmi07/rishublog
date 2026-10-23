# Implementation Plan: React Bits <Galaxy /> Background Animation Integration

Integrate the official `<Galaxy />` background component from React Bits (JS-CSS variant) into Rishu's Tech Blog as a full-page, interactive starfield background across dark sections with adapted contrast in light mode, mouse repulsion, and click warp.

## User Decisions & Clarifications
- **Placement**: Full-page background across all dark sections, layered behind content with `pointer-events-none` for content areas and interactive canvas layers allowing mouse repulsion and click warp.
- **Theme Adaptivity**: Active in both Light and Dark modes. In Dark mode, provides deep space ambiance with luminous stars and subtle cosmic nebula glow; in Light mode, adapts contrast with subtle celestial particle styling.
- **Interaction**: Full interactivity enabled (`mouseRepulsion`, `clickWarp`, `starSpeed={0.5}`, `glowIntensity={0.3}`, `flareIntensity={1}`).

---

## 1. Overview & Architecture

### What It Delivers
1. **Component Addition (`src/components/Galaxy.tsx` & `src/components/Galaxy.css`)**:
   - Faithful extraction of the official React Bits WebGL2-powered `<Galaxy />` shader component.
   - Clean TypeScript support, WebGL context loss cleanup, and responsive canvas sizing via `ResizeObserver`.
   - Zero external npm packages needed; pure WebGL2 and canvas shaders.

2. **Full-Page Background Layering**:
   - A fixed background container (`fixed inset-0 pointer-events-none z-0`) that spans the entire page behind navigation, hero, articles grid, about section, and footer.
   - Interactive mouse/pointer event listening so mouse repulsion and click warp feel natural without interfering with text selection, article clicking, or form inputs.
   - Subtle backdrop gradient masks to ensure 100% WCAG AA contrast and text legibility on all devices.

3. **Light/Dark Mode Synchronization**:
   - Synchronized with the blog's existing theme toggle (`theme` state in `App.tsx` and dark class on `<html>`).
   - Dynamically binds `lightMode={theme === 'light'}` and adapts canvas opacity.

---

## 2. Visual Architecture & Layout Rules

- **Anti-AI Slop & Visual Restraint**:
  - The galaxy stars remain an atmospheric backdrop, never overpowering the typography, code snippets, or article reading experience.
  - Cards and content sections retain semi-translucent glassmorphic/dark surfaces (`bg-zinc-900/85 backdrop-blur-md` in dark mode, `bg-white/90 backdrop-blur-md` in light mode) so the stars softly shimmer behind content.
  - Header, modals, and detail views remain perfectly legible with zero text clashing.

- **Pointer Event Architecture**:
  - The canvas listens to global window pointer movement for repulsion and canvas clicks for warp jump effects.
  - Interactive elements (buttons, links, search bar, modals) retain full priority and unhindered responsiveness.

---

## 3. Step-by-Step Implementation Steps

1. **Step 1: Create Component Files**:
   - Create `src/components/Galaxy.css` with the official container and canvas styles.
   - Create `src/components/Galaxy.tsx` with full TypeScript typings for all props (`density`, `glowIntensity`, `flareIntensity`, `starSpeed`, `mouseRepulsion`, `clickWarp`, `lightMode`, `transparent`, etc.).

2. **Step 2: Mount Background in `src/App.tsx`**:
   - Place `<Galaxy />` inside a persistent fixed background container behind main layout elements.
   - Pass configuration matching the user brief:
     ```tsx
     <Galaxy
       density={1}
       glowIntensity={theme === 'dark' ? 0.35 : 0.15}
       flareIntensity={theme === 'dark' ? 1 : 0.4}
       starSpeed={0.5}
       mouseRepulsion
       clickWarp
       lightMode={theme === 'light'}
       transparent
     />
     ```
   - Ensure content containers have appropriate z-index stacking (`relative z-10`).

3. **Step 3: Verification & Polish**:
   - Run `compile_applet` and `lint_applet` to confirm clean compilation and zero TypeScript errors.
   - Verify smooth 60fps rendering, responsive resizing on window change, and proper theme toggle behavior.
