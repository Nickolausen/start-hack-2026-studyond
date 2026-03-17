# Components, Layout & Animation

## Layout

### Grid Systems

```css
/* 3-column responsive grid */
.grid-3-col {
  @apply grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3;
}

/* 4-column responsive grid */
.grid-4-col {
  @apply grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}
```

### App Layout Pattern

```css
/* Sticky header */
.header {
  @apply bg-background sticky top-0 z-30 flex h-16 min-h-16 flex-shrink-0 justify-between;
}

/* Content scroll area */
.scroll-area {
  @apply h-full w-full px-6 lg:px-8;
}

.scroll-area-content {
  @apply pt-4 pb-8;
}
```

### Content Width

```css
/* Narrow content (forms, onboarding) */
.ds-layout-narrow { @apply md:max-w-3xl; }

/* Wide content (onboarding with preview) */
.ds-layout-onboarding { @apply md:max-w-3xl xl:max-w-7xl; }
```

### Responsive Breakpoints

| Name | Width | Key change |
|------|-------|------------|
| (base) | < 640px | Single column, stacked |
| `sm` | 640px | 2-column grids |
| `md` | 768px | Wider typography |
| `lg` | 1024px | 3-column grids, desktop nav |
| `xl` | 1280px | 4-column grids |

---

## Border Radius

| Token | Size | Use |
|-------|------|-----|
| `--radius` | 10px | Base (cards, containers) |
| `--radius-sm` | 6px | Small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 10px | Standard cards |
| `--radius-xl` | 14px | Large cards |

---

## Buttons

shadcn/ui button with CVA. Always fully rounded.

| Variant | Style | Use |
|---------|-------|-----|
| `default` | Dark bg, white text | Primary CTAs |
| `secondary` | Light gray bg | Secondary actions |
| `outline` | Border, white bg | Tertiary actions |
| `ghost` | Transparent, hover bg | Nav items, inline |
| `link` | Text only | Inline links |
| `destructive` | Red bg | Danger actions |

| Size | Style | Use |
|------|-------|-----|
| `default` | `h-9 px-4 py-2` | Standard |
| `sm` | `h-8 px-3` | Compact UI |
| `lg` | `h-10 px-6` | Hero CTAs |
| `icon` | `size-9` | Icon-only |

---

## Cards

- Standard radius: `rounded-lg` (~10px)
- No shadow by default — shadow only on hover
- Hover: `shadow-lg` + title color shift
- Image cards: 4:5 portrait aspect ratio
- Featured cards: 3:2 landscape

```tsx
<Card className="group overflow-hidden">
  <div className="aspect-[4/5] overflow-hidden">
    <img className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
  </div>
  <CardContent className="p-4">
    <h3 className="font-medium leading-snug line-clamp-2 transition-colors group-hover:text-primary">
      Title
    </h3>
    <p className="text-sm text-muted-foreground mt-1">Description</p>
  </CardContent>
</Card>
```

---

## Dialogs / Sheets

```css
/* Dialog overlay: subtle blur, no heavy darkening */
[data-slot='dialog-overlay'] {
  @apply h-screen w-screen bg-transparent opacity-30 backdrop-blur-3xl transition-all;
}
```

---

## Sidebar

Use shadcn's sidebar component. Studyond uses a collapsible sidebar with:
- Logo at top
- Navigation items with icons
- Sidebar extensions for contextual panels
- Mobile: sheet-based overlay

---

## Badges

```tsx
<Badge variant="default">Status</Badge>
<Badge variant="secondary">Category</Badge>
<Badge variant="outline">Tag</Badge>
```

---

## Icons

**Primary:** Lucide React (in app), Tabler Icons (in website)

```tsx
import { Search, ArrowRight, Plus } from "lucide-react";

<Search className="size-4" />       {/* 16px — standard */}
<ArrowRight className="size-5" />   {/* 20px — prominent */}
```

| Size | Use |
|------|-----|
| 12px (`size-3`) | Tiny indicators |
| 16px (`size-4`) | Standard — buttons, nav, metadata |
| 20px (`size-5`) | Slightly larger |
| 24px (`size-6`) | Mobile menu, prominent actions |

---

## Animation

### Timing

| Duration | Use |
|----------|-----|
| 150ms | Micro-interactions (button hover, color change) |
| 200ms | Deliberate transitions (dropdown, chevron) |
| 300ms | Standard — card hover, avatar expand |
| 500ms | Slow transitions (crossfade) |

### Rules

- **No bounce, no elastic, no overshoot** — everything smooth and measured
- Shadows only on hover, never static
- Card hover: image zoom `scale(1.05)` + title color shift
- Use `transition-colors`, `transition-transform`, `transition-all` Tailwind utilities
- Respect `prefers-reduced-motion`
