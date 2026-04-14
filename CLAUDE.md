# Torq Master Boilerplate — Design System Reference

> Source: Figma "Design-system-next-gen" (`ttMeOupdUylMbf3ouYtCmo`)
> Stack: Next.js 16 · TypeScript · Tailwind v4 · lucide-react
> Last synced: 2026-04-14

---

## Stack & Config Notes

- **Tailwind v4** — no `tailwind.config.js`. All tokens live in `src/app/globals.css` inside `@theme inline {}`.
- **Font**: `Inter` (load via `next/font/google` or a CDN link in `layout.tsx`).
- **Icons**: `lucide-react` — import named icons (`import { Search } from "lucide-react"`).
- **Dark mode**: driven by `prefers-color-scheme` media query in `globals.css`. Override `--background` / `--foreground` there.

---

## Color System

### Neutrals (Grey Scale)

| Token | CSS Variable | Hex |
|-------|-------------|-----|
| `neutral-0` | `--color-neutral-0` | `#FFFFFF` |
| `neutral-50` | `--color-neutral-50` | `#FAFAFC` |
| `neutral-100` | `--color-neutral-100` | `#F5F6FA` |
| `neutral-150` | `--color-neutral-150` | `#EBECF2` |
| `neutral-200` | `--color-neutral-200` | `#DDDFE6` |
| `neutral-250` | `--color-neutral-250` | `#CBCDD6` |
| `neutral-300` | `--color-neutral-300` | `#B0B3BD` |
| `neutral-350` | `--color-neutral-350` | `#9A9DA8` |
| `neutral-400` | `--color-neutral-400` | `#858894` |
| `neutral-500` | `--color-neutral-500` | `#5D5F6B` |
| `neutral-600` | `--color-neutral-600` | `#383A42` |
| `neutral-700` | `--color-neutral-700` | `#25272D` |
| `neutral-800` | `--color-neutral-800` | `#18181C` |
| `neutral-900` | `--color-neutral-900` | `#090A0B` |

### Primary — Brand Blue

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#F0F5FF` | Hover backgrounds |
| `primary-100` | `#E9EFFF` | Subtle fills |
| `primary-300` | `#B9CCFF` | Borders, outlines |
| `primary-400` | `#6393FD` | Secondary actions |
| **`primary-500`** | **`#2864FF`** | **Brand main — CTA buttons** |
| `primary-700` | `#083ABB` | Hover state |
| `primary-800` | `#002A99` | Active state |
| `primary-950` | `#001755` | Dark emphasis |

### Secondary Palette

| Name | Main Token | Hex | Use Case |
|------|-----------|-----|----------|
| Cyan | `cyan-500` | `#04C0FC` | Data viz, highlights |
| Teal | `teal-500` | `#29CA88` | Success, positive |
| Green (neon) | `green-500` | `#C9FF2E` | Accent, data |
| Yellow | `yellow-500` | `#FDD711` | Warning light |
| Orange | `orange-500` | `#FF8E2E` | Warning strong |
| Purple | `purple-500` | `#9275FF` | Special, AI |
| Magenta | `magenta-500` | `#FF7CAF` | Alert, highlight |

### Alert / Status Colors

| State | Token | Hex |
|-------|-------|-----|
| Error (mild) | `red-300` | `#FF7070` |
| **Error (main)** | **`red-500`** | **`#EA231A`** |
| Error (dark) | `red-700` | `#B30000` |
| Warning | `orange-500` | `#FF8E2E` |
| Success | `teal-500` | `#29CA88` |
| Info | `cyan-500` | `#04C0FC` |

### Semantic Aliases (prefer these in components)

```
--color-text-primary      #090A0B   — default body text
--color-text-secondary    #5D5F6B   — labels, captions
--color-text-tertiary     #9A9DA8   — placeholders, hints
--color-text-disabled     #CBCDD6   — disabled state
--color-text-inverse      #FFFFFF   — text on dark fills

--color-surface-primary   #FFFFFF   — main card / page bg
--color-surface-secondary #FAFAFC   — sidebar, panels
--color-surface-tertiary  #F5F6FA   — table rows, hover

--color-border-1          #EBECF2   — level-1 (subtle)
--color-border-2          #DDDFE6   — level-2 (default)
--color-border-3          #CBCDD6   — level-3 (strong)
--color-border-strong     #090A0B   — focused / active
```

---

## Typography

**Font family:** `Inter` (all weights)

### Text Styles

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Special / Hero | 36px | 400 or 600 | 1.33 |
| H1 | 28px | 400 | 1.29 |
| H2 | 24px | 400 | 1.33 |
| H3 | 20px | 400 | 1.40 |
| H4 | 16px | **700** | 1.50 |
| H5 | 16px | 400 | 1.50 |
| Body 0 (B0) | 16px | 400 / 600 | 1.50 |
| Body 1 (B1) | 14px | 400 / 600 | 1.43 (tall: 1.71) |
| Body 2 (B2) | 12px | 400 / 600 | 1.33 |
| Body 3 (B3) | 10px | 400 / 600 | 1.60 |

### CSS Custom Properties (font)

```css
--font-size-xs:   0.625rem;  /* 10px */
--font-size-sm:   0.75rem;   /* 12px */
--font-size-base: 0.875rem;  /* 14px — default body */
--font-size-md:   1rem;      /* 16px */
--font-size-lg:   1.25rem;   /* 20px */
--font-size-xl:   1.5rem;    /* 24px */
--font-size-2xl:  1.75rem;   /* 28px */
--font-size-3xl:  2.25rem;   /* 36px */

--font-weight-regular:  400;
--font-weight-semibold: 600;
--font-weight-bold:     700;
```

---

## Spacing

Base unit = **4px**. Use multiples:

| Token | rem | px |
|-------|-----|----|
| `--spacing-1` | 0.25rem | 4px |
| `--spacing-2` | 0.5rem | 8px |
| `--spacing-4` | 1rem | 16px |
| `--spacing-5` | 1.25rem | 20px |
| `--spacing-6` | 1.5rem | 24px |
| `--spacing-8` | 2rem | 32px |
| `--spacing-10` | 2.5rem | 40px |
| `--spacing-15` | 3.75rem | 60px |
| `--spacing-16` | 4rem | 64px |

---

## Border Radius

| Token | px | Usage |
|-------|----|-------|
| `--radius-sm` | 4px | Chips, badges, inputs |
| `--radius-md` | 8px | Cards, dropdowns |
| `--radius-lg` | 12px | Modals, panels |
| `--radius-xl` | 16px | Large cards |
| `--radius-full` | 9999px | Pills, avatars |

---

## Component Color Conventions

### Buttons
| Variant | BG | Text | Hover |
|---------|-----|------|-------|
| Primary | `primary-500` (#2864FF) | white | `primary-700` |
| Secondary | transparent | `text-primary` | `neutral-100` |
| Danger | `red-500` (#EA231A) | white | `red-700` |
| Warning | `orange-500` | white | `orange-700` |
| Ghost/Link | transparent | `primary-500` | `primary-50` |
| Disabled | `neutral-200` | `neutral-350` | — |

### Inputs
| State | Border | Background |
|-------|--------|-----------|
| Static | `border-2` (#DDDFE6) | `surface-primary` |
| Focus | `primary-500` | `surface-primary` |
| Disabled | `border-1` | `surface-secondary` |

### Cards
| State | Border |
|-------|--------|
| Default | `border-1` (#EBECF2) |
| Hover | `border-2` (#DDDFE6) |
| Active | `border-strong` (#090A0B) |

---

## Dark Mode

Dark mode flips via `prefers-color-scheme: dark`. Key swaps:

| Light | Dark |
|-------|------|
| `#FFFFFF` bg | `#18181C` bg |
| `#FAFAFC` surface | `#303138` surface |
| `#090A0B` text | `#FAFAFC` text |
| `#5D5F6B` secondary text | grey-300 range |

For explicit dark-mode overrides use Tailwind's `dark:` variant.

---

## Usage Examples

```tsx
// Primary button
<button className="bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-700)] rounded-[var(--radius-md)] px-4 py-2 text-[var(--font-size-base)] font-semibold">
  Save
</button>

// Error badge
<span className="bg-[var(--color-red-50)] text-[var(--color-red-500)] rounded-[var(--radius-sm)] px-2 py-1 text-[var(--font-size-sm)]">
  Error
</span>

// Secondary text
<p className="text-[var(--color-text-secondary)] text-[var(--font-size-base)]">
  Supporting copy
</p>
```

---

## File Map

```
src/
  app/
    globals.css      ← ALL design tokens (@theme inline)
    layout.tsx       ← Load Inter font here
    page.tsx
  components/        ← Build components using token CSS vars above
```
