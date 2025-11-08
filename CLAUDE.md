# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application with Turbopack
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint checks

### Package Management
- Uses `pnpm` as the package manager
- Configuration in `package.json` includes React 19 and Next.js 15.4.0-canary.42

## Project Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router and React 19
- **Language**: TypeScript with strict configuration
- **UI**: Shadcn UI components built on Radix UI primitives
- **Styling**: Tailwind CSS v4.1.4
- **State Management**: Zustand for global state, nuqs for URL query state
- **Forms**: React Hook Form with Zod validation
- **Package Manager**: pnpm

### Key Patterns

#### Server Actions
- Uses custom server actions (not next-safe-action despite being in .cursorrules)
- Example: `renderMarkdownPreviewAction` in `app/actions/notes.ts`
- Server actions are defined with `"use server"` directive

#### State Management
- **Zustand**: Global state management with hydration support
- **nuqs**: URL search parameter state management (useQueryState)
- **React Hook Form**: Form state with Zod schema validation

#### Component Architecture
- **Server Components**: Default, favor SSR
- **Client Components**: Marked with `"use client"` only when necessary
- **Shadcn UI**: Pre-built components in `components/ui/`
- **Feature Components**: Organized by domain (eisenhower/, notes/, projects/)

### Project Structure
```
app/                    # Next.js app directory
├── actions/           # Server actions
├── api/              # API routes
├── layout.tsx        # Root layout
├── providers.tsx     # React providers
└── globals.css       # Global styles

components/
├── ui/               # Shadcn UI components
├── eisenhower/       # Eisenhower matrix components
├── notes/           # Note-related components
├── projects/        # Project components
└── layout/          # Layout components

lib/
├── hooks/           # Custom React hooks
└── utils/           # Utility functions

config/              # Configuration files
hooks/               # Root-level custom hooks
```

### Core Features

#### Eisenhower Matrix
- Task prioritization using the Eisenhower matrix
- AI-powered task classification
- Drag-and-drop functionality with @dnd-kit
- Image support for tasks with markdown rendering

#### Notes System
- Markdown-based notes with live preview
- Image paste and drag-drop support
- IndexedDB storage for images
- Project association for notes
- Shiki syntax highlighting

#### Task Management
- Create, edit, and delete tasks
- Project-based organization
- Image attachments
- Priority classification (urgent/important matrix)

### Development Guidelines

#### Code Style (from .cursorrules)
- Use functional components with TypeScript interfaces
- Prefer named exports for components
- Use lowercase with dashes for directories
- Minimize `use client` directives
- Use descriptive variable names with auxiliary verbs (isLoading, hasError)

#### Performance
- Favor React Server Components over client components
- Wrap client components in Suspense
- Use dynamic loading for non-critical components
- Optimize images with WebP format and lazy loading

#### TypeScript Usage
- Use interfaces over types
- Avoid enums; use maps instead
- Functional components with proper typing
- Zod for runtime validation and type safety

### Custom Hooks

#### useMarkdownTextarea
- Image pasting and drag-drop functionality
- IndexedDB integration for local storage
- Markdown integration with automatic image syntax
- Located in `lib/hooks/use-markdown-textarea.ts`

#### Store Hydration
- Client-side hydration of server state
- Located in `lib/hooks/use-store-hydration.ts`

### UI Components

#### MarkdownTextarea
- Built-in image support
- Loading states and error handling
- Located in `components/ui/markdown-textarea.ts`

#### Eisenhower Matrix Components
- Drag-and-drop task management
- AI classification integration
- Located in `components/eisenhower/`

### Image Handling
- IndexedDB storage for local images
- Markdown integration with automatic syntax
- Support for PNG, JPEG, GIF, WebP, BMP
- Blob URLs for local image display