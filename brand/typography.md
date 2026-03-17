# Typography

## Fonts

| Role | Font | Fallback |
|------|------|----------|
| **Headlines (website)** | Crimson Text (serif, 400/600/700) | `ui-serif, Georgia, serif` |
| **Body / UI (app)** | Avenir Next, system stack | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto` |
| **Body / UI (website)** | Geist Variable (sans-serif) | `ui-sans-serif, system-ui, sans-serif` |

**Rule:** Serif is reserved for display-layer hero titles only. Everything else uses sans-serif.

For the hackathon, use the system font stack — no need to load custom fonts:

```css
html {
  font-family: "Avenir Next", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;
}
```

## Type Scale

| Class | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `.ds-caption` | 12px | 400 | 16px | Fine print, timestamps |
| `.ds-badge` | 12px | 500 | 16px | Badge labels |
| `.ds-label` | 14px | 500 | 20px | Form labels, metadata |
| `.ds-small` | 14px | 400 | 20px | Secondary body text |
| `.ds-body` | 16px | 400 | 24px | Primary body text |
| `.ds-title-cards` | 18px | 500 | 24px | Card titles |
| `.ds-title-sm` | 20px | 500 | 28px | Small headings |
| `.ds-title-md` | 24px | 500 | 32px | Section headings |
| `.ds-title-lg` | 30px | 500 | 36px | Page titles |
| `.ds-title-xl` | 36px | 500 | 40px | Hero titles |

### CSS

```css
.ds-caption   { font-size: 12px; font-weight: 400; line-height: 16px; }
.ds-badge     { font-size: 12px; font-weight: 500; line-height: 16px; }
.ds-label     { font-size: 14px; font-weight: 500; line-height: 20px; }
.ds-small     { font-size: 14px; font-weight: 400; line-height: 20px; }
.ds-body      { font-size: 16px; font-weight: 400; line-height: 24px; }
.ds-title-cards { font-size: 18px; font-weight: 500; line-height: 24px; }
.ds-title-sm  { font-size: 20px; font-weight: 500; line-height: 28px; }
.ds-title-md  { font-size: 24px; font-weight: 500; line-height: 32px; }
.ds-title-lg  { font-size: 30px; font-weight: 500; line-height: 36px; }
.ds-title-xl  { font-size: 36px; font-weight: 500; line-height: 40px; }
```

## Responsive Header Utilities

```css
.header-xl { @apply text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl; }
.header-lg { @apply text-2xl font-semibold tracking-tight sm:text-2xl lg:text-3xl; }
.header-md { @apply text-2xl font-semibold tracking-tight; }
.header-sm { @apply text-base font-medium leading-tight tracking-tight sm:text-lg lg:text-xl; }
```
