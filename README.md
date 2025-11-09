# Tasks - Next.js Application

A modern task management application built with Next.js 15, TypeScript, and Shadcn UI.

## Tech Stack

- **Framework:** Next.js 15.4.0-canary.42 (App Router)
- **Language:** TypeScript
- **UI Components:** Shadcn UI, Radix UI
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand, useQueryState (nuqs)
- **Form Handling:** React Hook Form, Zod
- **Server Actions:** Direct `"use server"` implementation
- **AI Integration:** AI SDK v4 with OpenAI
- **Markdown Processing:** Remark, Rehype, Shiki syntax highlighting
- **Notifications:** Sonner
- **Icons:** Lucide React, Tabler Icons
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tasks
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory and add necessary environment variables:
```env
# Add your environment variables here
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use functional components with proper typing
- Implement React Server Components where possible
- Follow SOLID principles and DRY (Don't Repeat Yourself)
- Use descriptive naming conventions

### Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   └── ...             # Custom components
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

### Key Features

- Server-side rendering with Next.js 15 App Router
- Direct server actions with `"use server"` directive
- Modern UI with Shadcn UI components and Radix primitives
- Responsive design with Tailwind CSS v4
- Global state management with Zustand
- URL state management with nuqs
- AI-powered markdown preview with syntax highlighting
- Toast notifications with Sonner
- Drag-and-drop task management with @dnd-kit

## Next.js 16 Migration Status

✅ **Phase 1 Foundation Complete**
- ✅ Documentation consistency updates
- ✅ Testing framework implementation
- ✅ Critical path tests created
- ✅ Dependency compatibility assessment

✅ **Phase 2 Core Migration Complete**
- ✅ Next.js upgraded to 16.0.0 stable
- ✅ Cache Components configured (PPR → Cache Components)
- ✅ AI SDK migrated to v5 with breaking API changes
- ✅ React updated to 19.2.0 with latest TypeScript types
- ✅ Async API patterns validated (no changes needed)
- ✅ Codemod validation completed (0 additional changes needed)
- ✅ Turbopack default (removed --turbopack flags)

🚧 **Phase 3 Cache Components Pending**
- ⏳ Incremental Cache Components implementation
- ⏳ Performance optimization with cache directives
- ⏳ Cache invalidation strategies

**Completed Changes**:
- **Framework**: Next.js 15.4.0-canary.42 → 16.0.0 stable
- **AI SDK**: v4.3.9 → v5.0.89 with API namespace changes
- **React**: 19.1.0 → 19.2.0
- **Configuration**: PPR → Cache Components architecture
- **Scripts**: Turbopack now default (removed --turbopack flags)
- **Testing**: Comprehensive test suite with Jest + Playwright
- **Codemods**: All Next.js 16 codemods validated (0 additional changes needed)

See `.claude/sessions/` for detailed migration planning and implementation logs.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
