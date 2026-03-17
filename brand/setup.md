# Setup

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| **Framework** | React 19 + TypeScript | Vite recommended |
| **Styling** | Tailwind CSS v4 | With `@tailwindcss/vite` plugin |
| **Components** | shadcn/ui (new-york style) | Headless components styled with CVA |
| **AI** | Vercel AI SDK | Streaming chat with tool use |
| **Icons** | Lucide React / Tabler Icons | 16px default size |
| **State** | Zustand | Lightweight stores |
| **Forms** | React Hook Form + Zod | Validation |
| **Animations** | Framer Motion | Optional — keep subtle |
| **Editor** | TipTap | Rich text |
| **Auth** | Auth0 | Authentication |
| **i18n** | i18next | English + German |

## Install

```bash
# Create project
npm create vite@latest my-studyond-app -- --template react-ts

# Install core dependencies
npm install tailwindcss @tailwindcss/vite
npm install ai @ai-sdk/anthropic   # or @ai-sdk/openai
npm install zustand
npm install lucide-react
npm install framer-motion           # optional

# Initialize shadcn
npx shadcn@latest init
# Choose: New York style, Zinc base color, CSS variables: yes
```

## shadcn Configuration

Your `components.json` should look like this:

```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/App.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## Recommended Components

```bash
npx shadcn@latest add button card input dialog badge tabs
npx shadcn@latest add form select textarea tooltip avatar
npx shadcn@latest add sidebar sheet dropdown-menu separator
```

## Next Steps

1. Copy the CSS variables from [`colors.md`](colors.md) into your `src/App.css`
2. Add the typography classes from [`typography.md`](typography.md)
3. Start building with components from [`components.md`](components.md)
