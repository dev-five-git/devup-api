# Devup API Landing Page

This is the landing page for Devup API, built with **Next.js** and **Devup UI**.

## Tech Stack

- **Next.js 15+** - React framework with App Router
- **Devup UI** - Zero-runtime CSS-in-JS styling library
- **TypeScript** - Type safety
- **React 19** - Latest React features

## Getting Started

### Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### Build for Production

```bash
npm run build
```

This will generate a static export in the `out/` directory.

### Preview Production Build

```bash
npm run start
```

## Project Structure

```
landing/
├── public/          # Static assets
├── src/
│   ├── app/         # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── CodeExamples.tsx
│   │   ├── Packages.tsx
│   │   └── Footer.tsx
│   └── components/  # Reusable components
├── devup.json       # Devup UI theme configuration
├── next.config.ts   # Next.js configuration
├── tsconfig.json    # TypeScript configuration
└── package.json
```

## Customization

### Theme

Edit `devup.json` to customize colors, typography, spacing, and breakpoints.

### Content

- **Hero Section**: `src/app/Hero.tsx`
- **Features**: `src/app/Features.tsx`
- **Code Examples**: `src/app/CodeExamples.tsx`
- **Packages**: `src/app/Packages.tsx`
- **Footer**: `src/app/Footer.tsx`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Devup UI Documentation](https://github.com/dev-five-git/devup-ui)
- [Devup API Documentation](https://github.com/dev-five-git/devup-api)
