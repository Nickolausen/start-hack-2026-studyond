# Image Generation

Generate brand-consistent images using Google Gemini (gemini.google.com) with our base prompt. This keeps all photography looking like it belongs to the same editorial world.

## Base Prompt

Prepend this to every image generation request:

```
Documentary-style photograph. Shot on 35mm lens, f/2.8, shallow depth of field.
Warm natural light, soft shadows. Muted warm color palette — not saturated.
Realistic skin texture, visible pores, no retouching. Slight film grain.
Candid energy, caught mid-moment, unposed. No eye contact with camera.
No artificial lighting. No stock photo aesthetic.
```

## How to Generate

1. **Write your subject description** — what the image should show (e.g., "A student working on their thesis at a wooden desk in a university library, laptop open, notes spread out")

2. **Choose an aspect ratio:**
   - **Landscape 16:9** — wide cinematic, good for hero sections and statements
   - **Square 1:1** — default format
   - **Portrait 9:16** — tall format for mobile-first layouts

3. **Combine into a full prompt:**

```
Documentary-style photograph. Shot on 35mm lens, f/2.8, shallow depth of field.
Warm natural light, soft shadows. Muted warm color palette — not saturated.
Realistic skin texture, visible pores, no retouching. Slight film grain.
Candid energy, caught mid-moment, unposed. No eye contact with camera.
No artificial lighting. No stock photo aesthetic.

Subject: A student working on their thesis at a wooden desk in a university
library, laptop open, notes spread out.

Aspect ratio: 16:9
```

4. **Paste into gemini.google.com** and generate
5. **Download** and add to your project

## Image Types & Naming

| Image type | Suggested folder | Naming |
|---|---|---|
| Hero images | `images/hero/` | `{page-context}.png` |
| Statement / CTA backgrounds | `images/statements/` | `{section-context}.png` |
| Showcase / general | `images/showcase/` | `{descriptive-name}.png` |
| People / avatars | `images/people/` | `{first-last}.png` |

## Style Guidelines

- **Photography:** Natural, candid, documentary feel — caught mid-moment
- **Lighting:** Warm natural light, soft shadows, no artificial setups
- **Color:** Muted warm palette, slightly desaturated — not vivid or saturated
- **Texture:** Slight film grain, realistic skin, no retouching
- **Subjects:** Students, workspaces, academic settings, collaboration, campus life
- **Avoid:** Stock photo clichés, overly posed shots, neon/saturated colors, eye contact with camera, artificial lighting

## Claude Code Users

If you're using Claude Code, you can set this up as a reusable skill. Create these two files:

**`~/.claude/skills/generate-image/skill.md`** — the workflow:

```markdown
---
name: generate-image
description: Generate website images via Gemini app. Builds a styled prompt, user generates in Gemini and drops the file into the project, then Claude renames and wires it into the codebase.
---

## Instructions

1. Get the image description from the user (or ask what the image should show)
2. Read the base prompt from ~/.claude/prompts/image-baseprompt.md
3. Ask the user for aspect ratio (16:9 landscape, 1:1 square, 9:16 portrait)
4. Combine base prompt + subject + aspect ratio into a full prompt
5. Present the prompt in a code block for the user to copy into gemini.google.com
6. Tell the user to save the generated image into src/assets/images/new/
7. When confirmed, find the file, move/rename it to the correct location
8. Wire it into the relevant component (update imports, alt text)
9. Clean up the new/ folder
```

**`~/.claude/prompts/image-baseprompt.md`** — the base prompt:

```markdown
Documentary-style photograph. Shot on 35mm lens, f/2.8, shallow depth of field.
Warm natural light, soft shadows. Muted warm color palette — not saturated.
Realistic skin texture, visible pores, no retouching. Slight film grain.
Candid energy, caught mid-moment, unposed. No eye contact with camera.
No artificial lighting. No stock photo aesthetic.
```

Then invoke it with `/generate-image` followed by your description.
