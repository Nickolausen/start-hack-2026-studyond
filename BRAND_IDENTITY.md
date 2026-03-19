# Studyond Brand Identity & Frontend Reference

> Complete reference for building frontend experiences that adhere to the Studyond brand.
> Synthesized from every file in `kickoff-material/` (brand, context, mock-data, skills).

---

## Table of Contents

1. [Brand Overview](#1-brand-overview)
2. [Design Philosophy -- Editorial Minimalism](#2-design-philosophy----editorial-minimalism)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Layout & Spacing](#5-layout--spacing)
6. [Components](#6-components)
7. [Animation & Motion](#7-animation--motion)
8. [AI Visual Language](#8-ai-visual-language)
9. [Photography & Image Style](#9-photography--image-style)
10. [Voice & Tone](#10-voice--tone)
11. [Audience Personas & UX Needs](#11-audience-personas--ux-needs)
12. [Platform Concepts & Terminology](#12-platform-concepts--terminology)
13. [Challenge Context](#13-challenge-context)
14. [Data Model & Mock Data](#14-data-model--mock-data)
15. [Value Propositions & Messaging](#15-value-propositions--messaging)
16. [Tech Stack](#16-tech-stack)
17. [Code Examples](#17-code-examples)
18. [Brand Review Checklist](#18-brand-review-checklist)
19. [CSS Reference (app.css)](#19-css-reference)

---

## 1. Brand Overview

**Studyond** is a Swiss government-backed three-sided marketplace connecting **students**, **companies**, and **universities** around thesis topics, research projects, and talent sourcing. Founded in 2023 as a University of St. Gallen (HSG) spin-off, backed by Innosuisse (Switzerland's federal innovation agency), in partnership with ETH Zurich, HSG, OST, and the Swiss Employers Association. Based in St. Gallen, Switzerland.

**Vision:** "As GitHub is to development and LinkedIn is to business identity, Studyond will be the central hub where academia-industry collaboration happens."

**Mission:** Build the infrastructure layer for knowledge and technology transfer between science and practice.

**Platform Scale:**
- 3,300+ students, 230+ professors, 185+ companies, 7,500+ topics
- 20+ Swiss universities, 1,680+ study programs
- Free for students and universities; revenue from company subscriptions

**Core Insight:** A thesis is a 4-6 month work sample -- the strongest predictor of job performance (r=.54, Schmidt & Hunter 1998). Studyond turns this into a structured hiring and innovation pipeline.

---

## 2. Design Philosophy -- Editorial Minimalism

Every visual decision is governed by five principles:

| # | Principle | What it means in practice |
|---|-----------|--------------------------|
| 1 | **Content first** | UI fades into the background. Typography and imagery carry the page, not chrome or decoration. |
| 2 | **Quiet confidence** | No flashy gradients or neon accents. Authority comes from restraint and precision. |
| 3 | **Functional color** | Color always means something (entity badges, status, AI features). It is **never decorative**. |
| 4 | **Consistent rhythm** | Same spacing scale and grid cadence across every page. |
| 5 | **Progressive disclosure** | Subtle hover states reveal more. Nothing screams for attention; interactions are discovered, not imposed. |

**Brand personality traits:**
- **Approachable** -- Rounded corners, warm tones, gentle spacing. Buttons are always fully rounded.
- **Editorial** -- Serif display headlines, typographic hierarchy inspired by print magazines.
- **Minimal** -- Black, white, and gray foundation. Color is introduced sparingly and with semantic purpose.
- **Professional** -- Clean lines, generous whitespace, no visual clutter.

**The result:** A brand that feels calm, credible, and focused -- a deliberate counterpoint to the anxiety students feel during the thesis process.

---

## 3. Color System

### 3.1 Foundation -- Monochrome by Default

Built on the **OKLCH color space**. All CSS variables are in `kickoff-material/brand/app.css`.

#### Light Mode

| Token | Hex (approx) | OKLCH | Use |
|-------|-------------|-------|-----|
| `--background` | `#FFFFFF` | `oklch(1 0 0)` | Page background |
| `--foreground` | `#1A1A1A` | `oklch(0.145 0 0)` | Primary text |
| `--card` | `#FFFFFF` | `oklch(1 0 0)` | Card background |
| `--card-foreground` | `#1A1A1A` | `oklch(0.145 0 0)` | Card text |
| `--popover` | `#FFFFFF` | `oklch(1 0 0)` | Popover background |
| `--popover-foreground` | `#1A1A1A` | `oklch(0.145 0 0)` | Popover text |
| `--primary` | `#2B2B2B` | `oklch(0.205 0 0)` | Buttons, active states |
| `--primary-foreground` | `#FBFBFB` | `oklch(0.985 0 0)` | Text on primary |
| `--secondary` | `#F5F5F5` | `oklch(0.97 0 0)` | Secondary surfaces |
| `--secondary-foreground` | `#2B2B2B` | `oklch(0.205 0 0)` | Text on secondary |
| `--muted` | `#F5F5F5` | `oklch(0.97 0 0)` | Muted backgrounds |
| `--muted-foreground` | `#808080` | `oklch(0.556 0 0)` | Labels, metadata |
| `--accent` | `#F5F5F5` | `oklch(0.97 0 0)` | Accent surfaces |
| `--accent-foreground` | `#2B2B2B` | `oklch(0.205 0 0)` | Text on accent |
| `--border` | `#ECECEC` | `oklch(0.922 0 0)` | Dividers, card edges |
| `--input` | `#ECECEC` | `oklch(0.922 0 0)` | Input borders |
| `--ring` | -- | `oklch(0.708 0 0)` | Focus rings |
| `--destructive` | `#E63946` | `oklch(0.577 0.245 27.325)` | Error states only |

#### Dark Mode

| Token | Hex (approx) | OKLCH | Use |
|-------|-------------|-------|-----|
| `--background` | `#1A1A1A` | `oklch(0.145 0 0)` | Page background |
| `--foreground` | `#FBFBFB` | `oklch(0.985 0 0)` | Primary text |
| `--card` | -- | `oklch(0.205 0 0)` | Card background (slightly lighter) |
| `--card-foreground` | `#FBFBFB` | `oklch(0.985 0 0)` | Card text |
| `--popover` | -- | `oklch(0.205 0 0)` | Popover background |
| `--popover-foreground` | `#FBFBFB` | `oklch(0.985 0 0)` | Popover text |
| `--primary` | `#ECECEC` | `oklch(0.922 0 0)` | Buttons, active states |
| `--primary-foreground` | `#2B2B2B` | `oklch(0.205 0 0)` | Text on primary |
| `--secondary` | `#3D3D3D` | `oklch(0.269 0 0)` | Secondary surfaces |
| `--secondary-foreground` | `#FBFBFB` | `oklch(0.985 0 0)` | Text on secondary |
| `--muted` | `#3D3D3D` | `oklch(0.269 0 0)` | Muted backgrounds |
| `--muted-foreground` | `#B3B3B3` | `oklch(0.708 0 0)` | Labels, metadata |
| `--accent` | `#3D3D3D` | `oklch(0.269 0 0)` | Accent surfaces |
| `--accent-foreground` | `#FBFBFB` | `oklch(0.985 0 0)` | Text on accent |
| `--border` | `white/10%` | `oklch(1 0 0 / 10%)` | Dividers |
| `--input` | -- | `oklch(1 0 0 / 15%)` | Input borders |
| `--ring` | -- | `oklch(0.556 0 0)` | Focus rings |
| `--destructive` | `#FF6B7A` | `oklch(0.704 0.191 22.216)` | Error states |

#### Sidebar Tokens

Dedicated sidebar tokens mirror the main palette in both modes. See `app.css` for the full set (`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, etc.).

#### Chart Colors

Five chart colors are defined for data visualization (`--chart-1` through `--chart-5`). They shift between light and dark mode. See `app.css`.

#### Text Selection

- **Light mode:** Warm yellow highlight
- **Dark mode:** Muted gold highlight

### 3.2 Where Color Is Allowed

Color is used **only** for:

1. **Entity type badges** -- people, organizations, audience types (greens, blues, etc.)
2. **Status indicators** -- active, pending, error
3. **AI features** -- purple-blue gradient (see section 8)

**Everything else stays monochrome.** No decorative color. No gradient backgrounds. No colorful sections.

### 3.3 Content Type Indicators

Content types are differentiated by **monochrome geometric animation**, not color. Each type has a unique dot animation on hover (300ms, CSS only):

| Type | Animation |
|------|-----------|
| Spotlight | Halo (second dot scales up behind main dot) |
| Voice | Message icon fades in over the dot |
| Outcome | Ring expands around the dot |
| Product Update | Dot rises, trail dot appears below |
| Event | Dot splits into two side by side |
| Press | Two wave arcs radiate from the dot |
| Announcement | Chevron extends from the dot |

---

## 4. Typography

### 4.1 Font Families

| Role | Font | Fallback Stack |
|------|------|---------------|
| **Display headlines (website)** | Crimson Text (serif, 400/600/700) | `ui-serif, Georgia, serif` |
| **Body / UI (app)** | Avenir Next | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| **Body / UI (website)** | Geist Variable (sans-serif) | `ui-sans-serif, system-ui, sans-serif` |

**Key rules:**
- Serif is reserved for display-layer hero titles **only**. Never for body text, UI elements, or small headings.
- **For the hackathon:** Use the system font stack -- no need to load custom fonts.
- Always use semantic heading tags (`h1`, `h2`, `h3`) in logical order for accessibility.

### 4.2 Type Scale (CSS Classes)

| Class | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `.ds-caption` | 12px | 400 | 16px | Fine print, timestamps, copyright |
| `.ds-badge` | 12px | 500 | 16px | Badge labels |
| `.ds-label` | 14px | 500 | 20px | Form labels, metadata, dates, authors (sentence case) |
| `.ds-small` | 14px | 400 | 20px | Secondary body text |
| `.ds-body` | 16px | 400 | 24px | Primary body text |
| `.ds-title-cards` | 18px | 500 | 24px | Card titles (2-line clamp, color shift on hover) |
| `.ds-title-sm` | 20px | 500 | 28px | Small headings |
| `.ds-title-md` | 24px | 500 | 32px | Section headings |
| `.ds-title-lg` | 30px | 500 | 36px | Page titles |
| `.ds-title-xl` | 36px | 500 | 40px | Hero titles |

### 4.3 Responsive Header Utilities

| Class | Tailwind Definition |
|-------|-------------------|
| `.header-xl` | `text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl` |
| `.header-lg` | `text-2xl font-semibold tracking-tight sm:text-2xl lg:text-3xl` |
| `.header-md` | `text-2xl font-semibold tracking-tight` |
| `.header-sm` | `text-base font-medium leading-tight tracking-tight sm:text-lg lg:text-xl` |

### 4.4 Display Layer (Website Hero Sections)

Serif (Crimson Text) titles used **only** for marketing hero sections. **Maximum one display title per page.**

- **Display:** 3rem -- 5rem, line-height 1.0
- **Headline:** 2.25rem -- 3.75rem

### 4.5 Labels and Metadata

- **Label:** 12px, medium weight, tracked -- card metadata (dates, authors), sentence case
- **Label upper:** 12px, medium weight, uppercase -- section divider labels, margin column labels, step numbers
- **Nav heading:** 14px, semibold -- footer column headings, navigation group titles

### 4.6 Metadata Formatting Pattern

Card metadata follows a strict pattern: **Author &middot; Date** (middle dot separator). Both in label style, muted color. Date format: "Jan 21, 2026."

---

## 5. Layout & Spacing

### 5.1 Signature Layout -- 3+9 Editorial Grid

The defining layout pattern:
- **3-column margin:** Section labels, table of contents, sticky wayfinding
- **9-column content:** Main content area
- **Gap:** 2.5rem
- **Activates at:** `lg` breakpoint (1024px); stacks to single column on mobile
- **Max container width:** 1360px, centered

### 5.2 Card Grids

| Breakpoint | Columns |
|------------|---------|
| Mobile (< 640px) | 1 |
| `sm` (640px) | 2 |
| `lg` (1024px) | 3 |
| `xl` (1280px) | 4 |

CSS utilities:
```css
.grid-3-col { @apply grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3; }
.grid-4-col { @apply grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4; }
```

### 5.3 Section Spacing

- **Major sections:** 48--96px between
- **Card grids / compact sections:** 24--48px

### 5.4 Content Width Utilities

| Class | Width |
|-------|-------|
| `.ds-layout-narrow` | `md:max-w-3xl` |
| `.ds-layout-onboarding` | `md:max-w-3xl xl:max-w-7xl` |

### 5.5 Sticky Header

```css
.header {
  @apply bg-background sticky top-0 z-30 flex h-16 min-h-16 flex-shrink-0 justify-between;
}
```

### 5.6 Scroll Area

```css
.scroll-area         { @apply h-full w-full px-6 lg:px-8; }
.scroll-area-content { @apply pt-4 pb-8; }
```

### 5.7 Border Radius Token Scale

| Token | Size | Use |
|-------|------|-----|
| `--radius` | 10px | Base (cards, containers) |
| `--radius-sm` | 6px | Small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 10px | Standard cards |
| `--radius-xl` | 14px | Large cards |

**Buttons:** Always fully rounded (pill shape). Non-negotiable brand element.

### 5.8 Responsive Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | < 640px | Single column, hamburger nav, stacked layout |
| `sm` | 640px | 2-column card grids |
| `md` | 768px | Wider typography |
| `lg` | 1024px | 3+9 grid activates, desktop nav, 3-column cards |
| `xl` | 1280px | 4-column cards, increased container padding |

---

## 6. Components

### 6.1 Buttons

All buttons are **fully rounded** (pill shape). This is a core brand element.

| Variant | Style | Use |
|---------|-------|-----|
| `default` | Dark bg, white text | Primary CTAs |
| `secondary` | Light gray bg | Secondary actions |
| `outline` | Border, white bg | Tertiary actions |
| `ghost` | Transparent, hover reveals bg | Nav items, inline actions |
| `link` | Text only | Inline links |
| `destructive` | Red bg | Danger actions only |

| Size | Style | Use |
|------|-------|-----|
| `default` | `h-9 px-4 py-2` | Standard |
| `sm` | `h-8 px-3` | Compact UI, header buttons |
| `lg` | `h-10 px-6` | Hero CTAs |
| `icon` | `size-9` | Icon-only |

### 6.2 Cards

Standard border radius ~10px. **Shadow appears only on hover, never static.**

| Type | Description |
|------|-------------|
| **InsightCard** | Image (4:5 portrait), gradient overlay, type badge top-left, avatar(s) bottom-right. Below: "Author &middot; Date" then card title (2-line clamp). |
| **Featured** | Landscape 3:2, larger radius, larger title, abstract text below. |
| **Compact** | Text-only with metadata + title + border separator. For dense listings. |

**Hover behavior:** Image scales to 1.05x, title shifts to primary color. That is the complete hover treatment -- nothing more.

### 6.3 Badges

Three variants: `default`, `secondary`, `outline`. Entity type badges use semantic color; content types use monochrome geometric animation.

### 6.4 Icons

| Library | Context | Default Size |
|---------|---------|-------------|
| Lucide React | App | 16px (`size-4`) |
| Tabler Icons | Website | 16px |

| Size | Class | Use |
|------|-------|-----|
| 12px | `size-3` | Tiny indicators |
| 16px | `size-4` | Standard -- buttons, nav, metadata |
| 20px | `size-5` | Slightly larger |
| 24px | `size-6` | Mobile menu, prominent actions |

Common icons: chevrons for navigation, arrows for CTAs, X for close.

### 6.5 Sidebar

Use shadcn's sidebar component. Studyond uses a collapsible sidebar with:
- Logo at top
- Navigation items with icons
- Sidebar extensions for contextual panels
- Mobile: sheet-based overlay

### 6.6 Dialogs / Sheets

Dialog overlay: subtle blur, no heavy darkening.

```css
[data-slot='dialog-overlay'] {
  @apply h-screen w-screen bg-transparent opacity-30 backdrop-blur-3xl transition-all;
}
```

### 6.7 shadcn/ui Configuration

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

---

## 7. Animation & Motion

### 7.1 Timing Scale

| Duration | Use |
|----------|-----|
| 150ms | Micro-interactions -- button hover, nav link color change |
| 200ms | Deliberate transitions -- dropdown open, chevron rotation |
| **300ms** | **Standard** -- card hover, avatar expand, badge morphs |
| 500ms | Slow transitions -- logo bar rotation, crossfade |

### 7.2 Common Patterns

| Element | Behavior |
|---------|----------|
| Card hover | Image zooms `scale(1.05)`, title shifts to primary color |
| Button hover | Background opacity shift |
| Links | Color change to primary, no underline animation |
| Dropdown chevron | 180-degree rotation on open/close |
| Mobile menu | Slide from left |
| Logo bar | Crossfade between logo sets |

### 7.3 Motion Rules

- **No bounce, no elastic, no overshoot.** Everything is smooth and linear.
- Shadows appear **only on hover**, never on static elements.
- Use Tailwind transition utilities: `transition-colors`, `transition-transform`, `transition-all`.
- Respect `prefers-reduced-motion`.
- Framer Motion is optional -- keep it subtle if used.

---

## 8. AI Visual Language

The **only** non-monochrome, non-badge color in the system. Reserved exclusively for genuinely AI-powered features. Misusing the gradient dilutes its signal value.

### 8.1 CSS Utilities

| CSS Class | Effect | Use |
|-----------|--------|-----|
| `.text-ai` | Gradient text (purple-to-blue via `bg-clip-text`) | AI badges, AI-powered labels |
| `.bg-ai` | Gradient background (`from-purple-700 via-blue-600 via-60% to-purple-700`) | AI feature cards, AI action buttons |
| `.text-ai-solid` | Solid `text-blue-600` | Simpler AI indicators |
| `.border-ai` | `border-blue-200` | AI-powered containers, input fields |

### 8.2 Where to Use

- AI badges marking features powered by the Student AI Agent or Expert AI Agent
- AI-powered buttons (e.g., "Find matching topics," "Generate suggestions")
- AI feature cards showcasing AI-driven content
- The Matching Engine interface where AI recommendations are surfaced

### 8.3 Where NOT to Use

The AI gradient must **never** appear on standard non-AI UI elements. If a feature does not involve AI processing, it gets the standard monochrome treatment.

### 8.4 AI SDK Integration

- **SDK:** Vercel AI SDK with streaming chat and tool use
- **Server route:** POST `/api/chat` with the Anthropic provider using `streamText`
- **Client component:** `useChat` hook from `ai/react` for streaming responses
- **Model:** Anthropic Claude models
- **UI modes:** Students can toggle between "Fast" and "Thinking" modes

---

## 9. Photography & Image Style

Generate brand-consistent images using Google Gemini with this base prompt:

```
Documentary-style photograph. Shot on 35mm lens, f/2.8, shallow depth of field.
Warm natural light, soft shadows. Muted warm color palette -- not saturated.
Realistic skin texture, visible pores, no retouching. Slight film grain.
Candid energy, caught mid-moment, unposed. No eye contact with camera.
No artificial lighting. No stock photo aesthetic.
```

**Key characteristics:**
- Natural, candid, documentary feel -- caught mid-moment
- Warm natural light, soft shadows
- Muted warm palette, slightly desaturated
- Slight film grain, realistic textures
- Subjects: students, workspaces, academic settings, collaboration, campus life

**Avoid:** Stock photo cliches, overly posed shots, neon/saturated colors, eye contact with camera, artificial lighting.

**Aspect ratios:**
- **16:9** -- landscape, hero sections, cinematic statements
- **1:1** -- default format
- **9:16** -- portrait, mobile-first layouts

**File organization:**

| Type | Folder | Naming |
|------|--------|--------|
| Hero images | `images/hero/` | `{page-context}.png` |
| Statement / CTA backgrounds | `images/statements/` | `{section-context}.png` |
| Showcase / general | `images/showcase/` | `{descriptive-name}.png` |
| People / avatars | `images/people/` | `{first-last}.png` |

---

## 10. Voice & Tone

### 10.1 Per-Audience Tone

| Audience | Tone | Language Rules |
|----------|------|---------------|
| **Students** | Warm, supportive, peer-like | Direct, active verbs ("find," "explore," "match"). Use "du" in German. Short, clear sentences. Validate thesis stress. Emphasize student agency. Never condescending. |
| **Companies** | Professional, outcome-driven, ROI-focused | Quantify results. Lead with outcomes, not features ("500 qualified proposals" not "matching platform"). Concise. Respect their time. |
| **Universities** | Formal but accessible, governance-aware | Institutional language. Respect academic autonomy. Position as enabling, not controlling. Emphasize partnership, not vendor-customer. |

### 10.2 Cross-Audience Pattern: "Missing Out" Narrative

Frame the status quo cost (what happens *without* Studyond) before presenting the solution. Use sparingly (1-2 per page). Always pair with positive resolution. Frame as opportunity cost, not threat.

**Examples:**
- **Students:** "What if I pick the wrong topic and waste 6 months?" --> "Here are real topics from real companies in your field."
- **Companies:** "By the time you interview, competitors have already engaged." --> "Connect with students during their thesis -- 6 months before they hit the job market."
- **Universities:** "Accreditation asks for industry linkage data, but we're reduced to surveys." --> "Every student-company interaction is tracked automatically."

### 10.3 Writing Don'ts

- No corporate jargon ("leverage synergistic platforms")
- No pressure tactics or sales-y tone for students
- No oversimplification of institutional complexity for universities
- No vague claims without data for companies
- No hand-holding language for companies
- No overpromising or simplification of governance for universities

### 10.4 Key Messaging by Audience

| Audience | One-Liner |
|----------|-----------|
| **Students** | "Find your thesis topic in 20 minutes. Real topics from real companies. Free, no strings." |
| **Companies (Talent)** | "Hire by work sample, not by CV. 60% lower cost-per-hire than LinkedIn Recruiter." |
| **Companies (Innovation)** | "Explore, validate, de-risk -- with academic rigor and at a fraction of consulting cost." |
| **Universities** | "Structured industry partnerships at scale. Free. Academic control stays with you." |

---

## 11. Audience Personas & UX Needs

### 11.1 Students

**Emotional arc:** Anxiety --> Discovery --> Confidence --> Action

**Trust triggers:**
- University endorsement (their own university uses it)
- "Free for students" (no cost, no hidden fees, no trial)
- Proof of topic volume in their specific field
- Social proof from peers

**Key objection:** "Is this legit? Is it really free? Will there be topics for MY field?"

#### Student Sub-Segments

| Segment | UX Need | Tone |
|---------|---------|------|
| **Final-Year Students** | Curated topics matched to field. Browsable without signup. "Free" messaging prominent. Reduce fear of commitment. | Reassuring, confidence-building, clear |
| **Early-Stage Students** | Volume/variety signals. Low-pressure exploration. Bookmark/save functionality. No forced signup. | Welcoming, low-pressure, exploratory |
| **Mid-Stage Students** | Quick access to relevant experts. Field/expertise filtering. Message templates. Efficiency-first. | Efficient, practical, action-oriented |
| **PhD Candidates** | Research-grade topic quality. Co-publication indicators. Academic control preserved. Supervisor endorsement. | Research-serious, academically respectful |
| **International Students** | Multilingual support. Language filtering. Clear "how it works." Companies welcoming international students. Simple onboarding. | Clear, inclusive, simple language |
| **Career-Transitioning** | Job opportunities from thesis companies. Thesis-to-hire visibility. Personalized advantage. | Encouraging, empowering, warm |
| **Lateral-Entry** | Instant field relevance. Own university logo. Ultra-fast value prop. No-friction signup. No guided tours. | Fast, clear, no-nonsense |

### 11.2 Companies

**Emotional arc:** Inefficiency --> Opportunity --> Trust --> Commitment

**Trust triggers:**
- Innosuisse backing
- University partner logos
- Clear ROI framing with quantified metrics
- Case studies with metrics (Big 4, Fortune 500)
- Governance model clarity

#### Company Sub-Segments

| Segment | UX Need | Tone |
|---------|---------|------|
| **HR & Talent Acquisition** | ROI comparisons (cost-per-hire). Pipeline metrics. Thesis = 6-month work sample proof. Pilot-friendly entry. | ROI-driven, evidence-based, competitive |
| **Innovation Managers** | Thesis as "low-risk exploration sprint." Cost comparison vs. consulting (CHF 50-150K). Evidence-based findings. Portfolio view. | Strategic, evidence-focused, innovation-portfolio language |
| **SME Executives** | Extreme simplicity. "Post a topic in minutes." Clear cost benchmarking. No enterprise jargon. Fast time-to-value. | Clear, direct, efficiency-focused |
| **Enterprise Executives** | Governance: RBAC, SSO, audit trails. Cross-department dashboard. Multi-year pipeline planning. GDPR compliance. | Strategic, institutional, governance-aware |

### 11.3 Universities

**Emotional arc:** Fragmentation --> Alignment --> Governance --> Partnership

**Trust triggers:**
- Peer universities already using it (HSG, BFH, 20+ Swiss)
- Governance model clarity
- Innosuisse backing
- Free, no procurement, no IT integration
- GDPR and Swiss FDPIC compliant

**Key objection:** "Do we lose academic control?"

#### University Sub-Segments

| Segment | UX Need | Tone |
|---------|---------|------|
| **Program Directors** | Engagement reports for accreditation. Zero IT integration. Free. Academic control retained. Cohort-level topic browsing. | Professional, outcome-focused, administrative-burden-aware |
| **Deans & Faculty** | Not direct UI users. Need shareable governance docs, peer adoption evidence, accreditation impact. | Formal, strategic, institutional |
| **Partnership Managers** | Automated matching/coordination. Companies post directly. Automated reporting dashboards. Platform continuity. | Practical, efficiency-focused, workload-aware |
| **Researchers** | Browse companies by domain. Connect with experts. Free. Domain-relevant filtering. | Academic, collegial, research-quality-focused |
| **Thesis Supervisors** | Topic quality assurance. Clear governance (professors retain authority). Bottom-up discovery flow. | Academic, practical, collegial peer-to-peer |

---

## 12. Platform Concepts & Terminology

### 12.1 Three-Sided Marketplace

"A table with 3 chairs" -- students, companies, and universities around the thesis process. No competitor connects all three sides.

- **Students** get free career-relevant thesis topics
- **Companies** unlock research capacity and identify talent (pay via subscriptions)
- **Universities** build industry linkage with full academic control (free)

### 12.2 Thesis Journey -- Five Stages

| Stage | Weeks | Description | Studyond Support |
|-------|-------|-------------|-----------------|
| 1. **Orientation** | 1-4 | Discovering what to write about. Most emotionally overwhelming phase. | Supported (AI Agent, topic browsing) |
| 2. **Topic & Supervisor Search** | 2-8 | Locking in a topic, supervisor, and possibly company partner. | Supported (Matching Engine, Applications) |
| 3. **Planning** | 4-10 | Structuring methodology, timeline, expectations. | NOT supported (opportunity space) |
| 4. **Execution** | 6-20 | Conducting research, gathering data, iterating. Longest and most isolating. | NOT supported (opportunity space) |
| 5. **Writing & Finalization** | 16-24 | Producing and submitting the thesis. | NOT supported (opportunity space) |

### 12.3 Universal Building Blocks

Every thesis eventually requires most of these:

| Building Block | Description |
|---------------|-------------|
| **Finding a Topic** | The research question anchoring everything. Studyond's primary value today. |
| **Finding a Supervisor** | The professor who guides and grades. Non-negotiable academic relationship. |
| **Company Partner** | Organization providing real-world context, data, or problems. |
| **Interview Partners** | Experts for qualitative research. Common bottleneck during execution. |
| **Data Access** | Datasets, surveys, internal company data. Often the hardest bottleneck. |
| **Methodology** | Research approach (qualitative, quantitative, mixed, design science). |
| **Timeline & Milestones** | Deadlines, deliverables, progress markers. Students consistently underestimate. |
| **Literature** | Academic papers and references for the literature review. |
| **Mentor & Feedback** | Ongoing guidance beyond the formal supervisor relationship. |

### 12.4 Core Design Principles (Challenge)

| Principle | Description |
|-----------|-------------|
| **Modular Entry** | Detect where the student is in their journey and adapt. No forced linear flows. |
| **Context Accumulation** | Every interaction builds a richer understanding. No stateless resets. |
| **Academic Governance** | AI suggests, matches, supports. The professor approves, guides, grades. |

### 12.5 Thesis Project Lifecycle States

```
proposed --> applied --> agreed --> in_progress --> completed
                |           |          |
             withdrawn   rejected   canceled
```

### 12.6 Key Platform Features

| Feature | Description |
|---------|-------------|
| **Matching Engine** | AI-powered matching (university, field, skills, degree level) across students, topics, supervisors, companies |
| **Student AI Agent** | Conversational topic discovery based on student profile (currently limited to discovery only) |
| **Expert AI Agent** | Helps company professionals transform business challenges into structured research topics |
| **Application Management** | Lightweight system for student applications to topics |
| **Direct Messaging** | Real-time chat between any platform users |

### 12.7 Subscription Tiers (Companies)

| Tier | Price | Key Features |
|------|-------|-------------|
| **Basic** | CHF 4,900/yr | 2 jobs, 2 owners, unlimited experts/topics, AI Topic Agent, matching |
| **Professional** | CHF 18,900/yr | 10 jobs, 5 owners, active sourcing, prioritized branding, dedicated support |
| **Enterprise** | From CHF 48,200/yr | Custom jobs, unlimited users, SSO, advisory modules, Innovation Partner label |

Individual accounts (students, supervisors, experts) are always free.

---

## 13. Challenge Context

### 13.1 The Problem

Every thesis student goes through roughly the same process, but everyone is at a different point. Today, students figure it out alone. Studyond supports stages 1-2 (topic discovery), but stages 3-5 (planning, execution, writing) are unsupported.

### 13.2 What to Build

Extend the journey from "I'm starting my thesis" to "I'm handing it in." The flow must respect Modular Entry, support Context Accumulation, and honor Academic Governance.

### 13.3 Possible Directions

1. **Modular Flow Wizard** -- Detect student's stage, adapt the flow dynamically
2. **AI Mentor Chat** -- Conversational agent with context accumulation across sessions
3. **Thesis Dashboard** -- Visual workspace tracking progress, milestones, connections
4. **Autonomous Agents** -- Proactively find interview partners, suggest literature, identify company partners
5. **Context-Building System** -- Progressive profile growing with each interaction

### 13.4 Evaluation Criteria

1. **Real Problem Solving** -- Addresses genuine student pain points
2. **Creativity** -- Novel approaches beyond "just a chatbot"
3. **Coherence** -- Well-integrated flow; pieces fit together
4. **Ecosystem Usage** -- Leverages Studyond's existing building blocks and mock data
5. **Compelling UX** -- Built on Editorial Minimalism principles; feels considered, not default

### 13.5 Opportunity Space

What does NOT exist yet:
- Adaptive onboarding (Modular Entry)
- Planning and execution support
- Context persistence across conversations
- Autonomous proactive agents
- Structured mentor access
- Cross-entity intelligence ("This supervisor's research aligns with this company's topic and this expert's domain")

---

## 14. Data Model & Mock Data

### 14.1 Entity Relationships

```
University --- has many --> Study Programs --- has many --> Students
    |                                                          |
    |                                                          |
    +-- has many --> Supervisors --> post --> Topics            |
    |                                (supervisor topics)       |
    |                                                          |
    |                            Topics <-- post --+           |
    |                         (company topics)     |           |
    |                                              |           |
    |                        Companies --- have --> Experts     |
    |                            |                             |
    |                            |                             |
    +---------------- Thesis Project --------------------------+
                   (links them all together)
```

### 14.2 Entity Summary

| Entity | Records | Key Properties |
|--------|---------|---------------|
| **University** | 10 | `id`, `name`, `country`, `domains[]`, `about` |
| **StudyProgram** | 30 | `id`, `name`, `degree` (bsc/msc/phd), `universityId`, `about` |
| **Field** | 20 | `id`, `name` (e.g., "Data Science", "Supply Chain Management") |
| **Student** | 40 | `id`, `firstName`, `lastName`, `email`, `degree`, `studyProgramId`, `universityId`, `skills[]`, `about`, `objectives[]`, `fieldIds[]` |
| **Supervisor** | 25 | `id`, `firstName`, `lastName`, `email`, `title` (academic), `universityId`, `researchInterests[]`, `about`, `objectives[]`, `fieldIds[]` |
| **Company** | 15 | `id`, `name`, `description`, `about`, `size`, `domains[]` |
| **Expert** | 30 | `id`, `firstName`, `lastName`, `email`, `title` (job role), `companyId`, `offerInterviews`, `about`, `objectives[]`, `fieldIds[]` |
| **Topic** | 60 | `id`, `title`, `description`, `type` (topic/job), `employment`, `employmentType`, `workplaceType`, `degrees[]`, `fieldIds[]`, `companyId`/`universityId`, `expertIds[]`/`supervisorIds[]` |
| **ThesisProject** | 15 | `id`, `title`, `description`, `motivation`, `state`, `studentId`, `topicId` (nullable), `companyId`, `universityId`, `supervisorIds[]`, `expertIds[]`, `createdAt`, `updatedAt` |

### 14.3 Key Enums

```typescript
type Degree = "bsc" | "msc" | "phd";
type TopicType = "topic" | "job";
type TopicEmployment = "yes" | "no" | "open";
type TopicEmploymentType = "internship" | "working_student" | "graduate_program" | "direct_entry";
type TopicWorkplaceType = "on_site" | "hybrid" | "remote";
type ProjectState = "proposed" | "applied" | "withdrawn" | "rejected" | "agreed" | "in_progress" | "canceled" | "completed";
type StudentObjective = "topic" | "supervision" | "career_start" | "industry_access" | "project_guidance";
type ExpertObjective = "recruiting" | "fresh_insights" | "research_collaboration" | "education_collaboration" | "brand_visibility";
type SupervisorObjective = "student_matching" | "research_collaboration" | "network_expansion" | "funding_access" | "project_management";
```

### 14.4 Ownership Rule

A topic has **either** `companyId` **or** `universityId` -- never both. Company topics list `expertIds`; supervisor topics list `supervisorIds`.

### 14.5 Project-First Model

ThesisProjects can exist **without a topic** (`topicId: null`). Projects progressively accumulate context. This is the foundation for the Context Accumulation principle.

### 14.6 ID Format

All IDs are human-readable: `student-01`, `supervisor-12`, `topic-45`, `project-03`.

### 14.7 Mock Data Files

| File | Records |
|------|---------|
| `universities.json` | 10 |
| `study-programs.json` | 30 |
| `fields.json` | 20 |
| `students.json` | 40 |
| `supervisors.json` | 25 |
| `companies.json` | 15 |
| `experts.json` | 30 |
| `topics.json` | 60 |
| `projects.json` | 15 |

---

## 15. Value Propositions & Messaging

### 15.1 Student Value Proposition

- Free access to real thesis topics from real companies
- AI-powered matching to field and interests
- Direct connections to expert interview partners
- Time to first value: browse matching topics within minutes of signup
- "Your thesis is your career capital -- a 6-month work sample"

### 15.2 Company Value Proposition -- Talent

- Year-round access to 1,680+ study programs, 20+ Swiss universities
- Assess candidates through real thesis work, not CVs
- Cost per hire: ~CHF 6,300 (vs. LinkedIn CHF 15K+, career fair CHF 20K/event, miss-hire CHF 20K+)
- **Do NOT mix** talent and innovation messaging for the same audience

### 15.3 Company Value Proposition -- Innovation

- Thesis projects as low-risk innovation sprints
- CHF 18,900/year for up to 10 exploration sprints vs. CHF 50-150K for one consultant
- 41% of collaborating firms report concrete innovation outcomes
- **Do NOT mix** innovation and talent messaging for the same audience

### 15.4 Company Value Proposition -- Employer Branding

- Year-round visibility across 20+ Swiss universities, 365 days
- Topic-driven discovery (students find companies through topic fit, not logo size)
- Especially valuable for SMEs competing against Fortune 500 for graduates

### 15.5 University Value Proposition

- Systematic, scalable industry linkage at zero cost
- No IT integration, no procurement, no budget required
- Full academic control preserved
- Measurable engagement data for accreditation reporting

### 15.6 Selection Validity Hierarchy (for data viz)

| Method | Validity (r) | Notes |
|--------|-------------|-------|
| Work sample tests | .54 | Strongest predictor -- thesis is a natural work sample |
| Structured interviews | .51 | Expensive, time-limited |
| Cognitive ability tests | .51 | Not role-specific |
| Job knowledge tests | .48 | Narrow scope |
| Assessment centers | .37 | Artificial, expensive |
| Conscientiousness | .31 | Trait-based, indirect |
| Reference checks | .26 | Subject to bias |
| Years of experience | .18 | Diminishing returns |
| Unstructured interviews | .20 | High bias |
| CVs / resumes | .18-.26 | Increasingly unreliable (GenAI inflation) |

### 15.7 Traction Numbers (for social proof)

- 3,300+ students, 230+ professors, 185+ companies, 7,500+ topics
- 20+ Swiss universities
- 7 study program co-creations launched Q1 2026
- 493 study program leaders surveyed (51.2% response rate)
- Thesis Impact Summit 2025: 215+ decision-makers from 19 universities
- Clients include Big 4 and Fortune 500 companies
- Backed by Innosuisse, ETH Zurich, HSG, OST, Swiss Employers Association

---

## 16. Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| **Framework** | React 19 + TypeScript | Vite recommended |
| **Styling** | Tailwind CSS v4 | With `@tailwindcss/vite` plugin |
| **Components** | shadcn/ui (new-york style) | Headless components styled with CVA |
| **AI** | Vercel AI SDK | Streaming chat with tool use, Anthropic provider |
| **Icons** | Lucide React (app) / Tabler Icons (website) | 16px default |
| **State** | Zustand | Lightweight stores |
| **Forms** | React Hook Form + Zod | Validation |
| **Animation** | Framer Motion | Optional -- keep subtle |
| **Editor** | TipTap | Rich text |
| **Auth** | Auth0 | Authentication |
| **i18n** | i18next | English + German |

### Install Commands

```bash
npm create vite@latest my-studyond-app -- --template react-ts
npm install tailwindcss @tailwindcss/vite
npm install ai @ai-sdk/anthropic
npm install zustand
npm install lucide-react
npm install framer-motion

npx shadcn@latest init  # Style: New York, Base color: Zinc, CSS variables: Yes
npx shadcn@latest add button card input dialog badge tabs
npx shadcn@latest add form select textarea tooltip avatar
npx shadcn@latest add sidebar sheet dropdown-menu separator
```

---

## 17. Code Examples

### 17.1 Image Card with Hover

```tsx
import { Card, CardContent } from "@/components/ui/card";

export function ImageCard() {
  return (
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
  );
}
```

### 17.2 Badges

```tsx
import { Badge } from "@/components/ui/badge";

export function BadgeExamples() {
  return (
    <div className="flex gap-2">
      <Badge variant="default">Status</Badge>
      <Badge variant="secondary">Category</Badge>
      <Badge variant="outline">Tag</Badge>
    </div>
  );
}
```

### 17.3 Icons

```tsx
import { Search, ArrowRight, Plus } from "lucide-react";

export function IconExamples() {
  return (
    <div className="flex items-center gap-2">
      <Search className="size-4" />       {/* 16px -- standard */}
      <ArrowRight className="size-5" />   {/* 20px -- prominent */}
      <Plus className="size-6" />         {/* 24px -- large */}
    </div>
  );
}
```

### 17.4 AI Accent Usage

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AiAccentExamples() {
  return (
    <div className="space-y-4">
      {/* AI badge */}
      <span className="text-ai font-semibold">AI Suggestion</span>

      {/* AI button */}
      <Button className="bg-ai hover:opacity-90">Ask AI</Button>

      {/* AI card border */}
      <Card className="border-ai">
        <CardContent className="p-4">AI-enhanced content</CardContent>
      </Card>
    </div>
  );
}
```

### 17.5 AI Chat (Client Component)

```tsx
import { useChat } from "ai/react";

function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <form onSubmit={handleSubmit}>
      {messages.map((m) => (
        <div key={m.id}>{m.content}</div>
      ))}
      <input value={input} onChange={handleInputChange} />
    </form>
  );
}
```

### 17.6 AI Chat (Server Route)

```tsx
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    messages,
  });
  return result.toDataStreamResponse();
}
```

---

## 18. Brand Review Checklist

### Colors
- [ ] Uses semantic tokens (`bg-primary`, `text-muted-foreground`), not raw colors (`#fff`, `blue-500`)
- [ ] No decorative color usage -- color only for meaning (status, type badges, AI accent)
- [ ] AI gradient classes (`.text-ai`, `.bg-ai`) used only for AI-specific features
- [ ] No gradient backgrounds or colorful sections

### Typography
- [ ] Uses design system classes (`ds-body`, `ds-title-md`, `header-xl`) or equivalent Tailwind
- [ ] No serif fonts for body/UI text (serif is display-only, Crimson Text for hero titles)
- [ ] No more than one hero/display title per page
- [ ] Semantic heading tags (`h1`, `h2`, `h3`) in logical order

### Layout
- [ ] Uses grid system classes (`grid-3-col`, `grid-4-col`) or equivalent responsive grids
- [ ] Content constrained with `ds-layout-narrow` or `ds-layout-onboarding` where appropriate
- [ ] Consistent spacing rhythm (48-96px major sections, 24-48px compact)
- [ ] Max container width 1360px

### Components
- [ ] Buttons are **fully rounded** (pill shape) -- always
- [ ] Cards have **no static shadows** (shadow only on hover via `shadow-lg`)
- [ ] Image cards use 4:5 portrait or 3:2 landscape aspect ratios
- [ ] Using shadcn/ui components as base, not custom implementations
- [ ] Using border radius token scale, not raw values

### Animation
- [ ] Timing: 150ms micro, 200ms deliberate, 300ms standard, 500ms slow
- [ ] No bounce, elastic, or overshoot easing
- [ ] Card hover: `scale(1.05)` image zoom + title color shift
- [ ] Uses Tailwind transition utilities (`transition-colors`, `transition-transform`)
- [ ] Respects `prefers-reduced-motion`
- [ ] Shadows appear only on hover

### AI Features
- [ ] AI gradient used only for genuinely AI-powered features
- [ ] Standard non-AI elements use monochrome treatment
- [ ] AI streaming uses Vercel AI SDK with `useChat` hook

### Voice & Tone
- [ ] Student-facing copy is warm, supportive, peer-like with active verbs
- [ ] Company-facing copy is professional, outcome-driven, ROI-focused with quantified claims
- [ ] University-facing copy is formal but accessible, governance-aware
- [ ] "Missing out" narrative used sparingly (max 1-2 per page), always paired with resolution
- [ ] No corporate jargon, no pressure tactics, no vague claims

### Data
- [ ] Uses mock data from `kickoff-material/mock-data/` with correct entity relationships
- [ ] Respects topic ownership rule (company XOR university, never both)
- [ ] Supports project-first model (topicId can be null)
- [ ] Uses human-readable IDs (`entity-NN`)

---

## 19. CSS Reference

The complete design system CSS lives in `kickoff-material/brand/app.css`. Copy it to `src/App.css`.

It contains:
- Tailwind CSS v4 import and custom dark variant
- `@theme inline` block mapping all semantic tokens
- `:root` (light mode) and `.dark` (dark mode) variable definitions
- AI accent utility classes (`.text-ai`, `.bg-ai`, `.text-ai-solid`, `.border-ai`)
- Typography scale classes (`.ds-caption` through `.ds-title-xl`)
- Responsive header utilities (`.header-xl` through `.header-sm`)
- Layout grid utilities (`.grid-3-col`, `.grid-4-col`)
- Sticky header, scroll area, content width utilities
- Dialog overlay customization
- Base layer styles (border, outline, body background/text)

Dark mode is toggled by adding the `.dark` class to a parent element.

---

## 20. Logo

The Studyond wordmark SVG is at `kickoff-material/brand/studyond.svg`. It uses fill color `#2D2D2D` and includes the geometric mark (right side) alongside the "studyond" logotype. For dark mode, invert the logo to white.
