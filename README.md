# Cheshire Cat AI - Website

Official website for [cheshirecat.ai](https://cheshirecat.ai).

Built with [Astro](https://astro.build/) and [React](https://react.dev/).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Preview production build

```bash
pnpm preview
```

## Project Structure

```
src/
├── assets/          # Static assets (images, etc.)
├── components/      # UI components (Astro + React)
├── content/         # Content collections (blog, authors, pages)
├── layouts/         # Page layouts
├── pages/           # File-based routing
│   ├── blog/        # Blog pages
│   ├── author/      # Author pages
│   ├── rss.xml.js   # RSS feed
│   └── index.astro  # Homepage
├── styles/          # Global styles
├── consts.ts        # Site-wide constants
└── content.config.ts
public/
├── fonts/           # Custom fonts
├── favicon.ico
└── favicon.svg
```
