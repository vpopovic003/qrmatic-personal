# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QRMatic is a Next.js 15.5.4 application using React 19.1.0 with the App Router architecture. The project was bootstrapped with `create-next-app` and uses modern Next.js conventions.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build` (production build with Turbopack)
- **Start production**: `npm start`
- **Lint**: `npm run lint` (ESLint with Next.js core web vitals config)

The development server runs on http://localhost:3000.

## Architecture

- **Framework**: Next.js 15 with App Router
- **Main entry point**: `app/page.js`
- **Layout**: Root layout in `app/layout.js` with Geist font family integration
- **Styling**: CSS Modules (`page.module.css`) and global styles (`globals.css`)
- **Build tool**: Turbopack (enabled for both dev and build)

## Key Files Structure

- `app/` - Next.js App Router directory containing pages and layouts
- `app/layout.js` - Root layout with font configuration and metadata
- `app/page.js` - Homepage component
- `app/globals.css` - Global CSS styles
- `next.config.mjs` - Next.js configuration (currently minimal)
- `eslint.config.mjs` - ESLint configuration with Next.js rules

## Fonts

The project uses Geist Sans and Geist Mono fonts from Google Fonts, configured as CSS variables in the root layout.