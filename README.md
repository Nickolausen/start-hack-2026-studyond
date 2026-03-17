# Studyond -- StartHack 2026

Welcome! This repository contains everything you need to work on the Studyond hackathon challenge.

## About Studyond

**Studyond AG** is a Swiss startup (HSG spin-off, ETH startup) backed by Innosuisse. We operate a three-sided marketplace connecting **students**, **companies**, and **universities** around thesis topics, research projects, and talent sourcing.

**Website:** [studyond.com](https://studyond.com)

## The Challenge

Design and prototype an **AI-powered thesis journey** -- a modular, adaptive flow that guides students through their entire thesis process using Studyond's existing ecosystem (topics, supervisors, companies, experts, mentors, AI matching).

Full brief: [`context/challenge.md`](context/challenge.md)

## Context

The `context/` folder is your knowledge base about Studyond. Use it as a reference -- load it into your AI tools, ask questions against it, or browse it directly.

Start with [`context/index.md`](context/index.md) for a map of what's available.

| File | What's inside |
|------|--------------|
| [`challenge.md`](context/challenge.md) | The hackathon brief, what to build, evaluation |
| [`studyond-overview.md`](context/studyond-overview.md) | Company, team, vision, competitive positioning |
| [`platform.md`](context/platform.md) | Current features, data model, what exists today |
| [`thesis-journey.md`](context/thesis-journey.md) | The thesis process end-to-end, pain points, opportunity |
| [`audiences.md`](context/audiences.md) | Students, companies, universities: needs and motivations |
| [`brand.md`](context/brand.md) | Voice, tone, design language, visual identity |
| [`evidence.md`](context/evidence.md) | Research, hiring science, competitive landscape |

## Brand & UI

The `brand/` folder contains assets and references for building on-brand interfaces:

Start with [`brand/README.md`](brand/README.md) for an overview, then grab what you need:

| File | What's inside |
|------|--------------|
| [`setup.md`](brand/setup.md) | Tech stack, install commands, shadcn config |
| [`colors.md`](brand/colors.md) | Copy-pasteable CSS variables (light + dark mode) |
| [`typography.md`](brand/typography.md) | Font stack, type scale classes |
| [`components.md`](brand/components.md) | Layout, components, icons, animation |
| [`ai-integration.md`](brand/ai-integration.md) | Vercel AI SDK setup, AI visual style |
| [`image-generation.md`](brand/image-generation.md) | Generate brand-consistent images with Gemini |
| [`studyond.svg`](brand/studyond.svg) | Logo |

## Using the Context with AI Tools

These files are designed to work as LLM context. Some ways to use them:

- **Claude Code / Cursor / Windsurf:** Open this repo and your AI assistant can read and reference the context files directly
- **ChatGPT / Claude chat:** Copy-paste relevant files into your conversation
- **Custom setup:** Load the files into any RAG system or context window

The `index.md` file acts as a routing layer -- an AI assistant can read it first to understand what's available, then pull specific files as needed.

---

Good luck! Build something amazing.
