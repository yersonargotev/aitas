# Tasks - Next.js Application

A modern task management application built with Next.js 14, TypeScript, and Shadcn UI.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Components:** Shadcn UI, Radix UI
- **Styling:** Tailwind CSS
- **State Management:** React Query, useQueryState (nuqs)
- **Form Handling:** React Hook Form, Zod
- **Server Actions:** next-safe-action
- **Notifications:** Sonner
- **Icons:** Lucide React
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

- Server-side rendering with Next.js
- Type-safe server actions
- Modern UI with Shadcn UI components
- Responsive design with Tailwind CSS
- URL state management with nuqs
- Toast notifications with Sonner

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
