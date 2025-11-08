# Gemini Project Context: Aitas - AI-Powered Task Manager

This document provides a comprehensive overview of the Aitas project, its architecture, and development conventions to be used as instructional context for future interactions.

## Project Overview

Aitas is a modern, AI-enhanced task management application built with Next.js 14. It helps users organize tasks using the Eisenhower Matrix, which categorizes tasks into four quadrants: Urgent/Important, Not Urgent/Important, Urgent/Not Important, and Not Urgent/Not Important. The application is a single-page interface with tabs for a dashboard, the task matrix, and notes.

### Core Technologies

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Turbopack, React Compiler)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Framework:** [Shadcn UI](https://ui.shadcn.com/) on top of [Radix UI](https://www.radix-ui.com/) and styled with [Tailwind CSS](https://tailwindcss.com/).
- **State Management:**
    - [Zustand](https://zustand-demo.pmnd.rs/) for global client-side state (e.g., `useTaskStore`).
    - [React Query](https://tanstack.com/query/latest) (implied by TanStack dependencies, though not explicitly used in the files reviewed).
    - [nuqs](https://nuqs.47ng.com/) for managing state in URL query parameters.
- **Data Persistence:**
    - `localStorage` for persisting task data via `zustand/persist`.
    - `IndexedDB` for storing images associated with tasks, managed by the `image-storage` utility.
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for schema validation.
- **AI:** The Vercel AI SDK (`@ai-sdk/openai`, `@ai-sdk/react`) is integrated, suggesting features for AI-based task classification or suggestions.
- **Markdown:** Notes are rendered with Markdown support, including syntax highlighting via [Shiki](https://shiki.style/).

### Architecture

The application follows the standard Next.js App Router structure.

- **`app/`**: Contains the main application logic, including pages (`page.tsx`), layouts (`layout.tsx`), and server-side logic (`actions/`).
- **`components/`**: A well-organized library of React components, including reusable UI elements (`ui/`), feature-specific components (`eisenhower/`, `notes/`), and layout components (`layout/`).
- **`lib/`**: Contains utility functions, custom hooks (`hooks/`), and Zustand stores (`stores/`). The `task-store.ts` is central to the application's state management.
- **`config/`**: Holds site-wide configuration, such as metadata and theme colors.
- **`public/`**: Stores static assets like icons and images.

## Building and Running the Project

The project uses `pnpm` as its package manager.

- **Install dependencies:**
  ```bash
  pnpm install
  ```

- **Run the development server:**
  The dev script uses Next.js's Turbopack for faster development.
  ```bash
  pnpm dev
  ```
  The application will be available at [http://localhost:3000](http://localhost:3000).

- **Build for production:**
  The build script also uses Turbopack.
  ```bash
  pnpm build
  ```

- **Run the production server:**
  ```bash
  pnpm start
  ```

- **Lint the code:**
  The project uses ESLint with Next.js's recommended configuration.
  ```bash
  pnpm lint
  ```

## Development Conventions

- **Styling:** Use Tailwind CSS utility classes for styling. Custom styles are defined in `app/globals.css`.
- **Components:** Components are built using React Server Components (RSC) and Client Components ("use client") where interactivity is needed. Reusable, atomic UI components are located in `components/ui/`.
- **State Management:** For global client state, use the existing Zustand stores. For server-side data fetching and mutations, prefer using Server Actions.
- **Server Logic:** Server-side logic is encapsulated in Server Actions within the `app/actions/` directory.
- **Typing:** All code should be strongly typed using TypeScript. Type definitions for shared data structures are located in the `types/` directory.
- **Environment Variables:** The project uses a `.env` file for environment variables. Refer to the `README.md` for any required variables.
- **Package Management:** Use `pnpm` for all package management operations.
