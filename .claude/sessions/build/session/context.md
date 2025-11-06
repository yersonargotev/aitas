# Research Context: Notes and Project Association Feature

**Session ID**: session
**Date**: 2025-11-05
**Task Classification**: MEDIUM
**Estimated Lines**: 300-500
**Estimated Files**: 5-8
**Complexity**: Medium
**Research Depth**: Detailed analysis

## Problem Statement

Implement a feature where:
- Notes can be associated with a project
- Notes without a project are shown separately (standalone notes)
- The UI should clearly separate project-related notes from standalone notes

Currently, all notes REQUIRE a projectId, but there's no clear separation in the UI for notes that belong to actual projects vs. standalone notes. The main dashboard uses a hardcoded "main_dashboard_notes" projectId.

## Codebase Landscape

### Project Structure

```
/Users/usuario1/Documents/me/ai/aitas/
├── app/
│   ├── actions/notes.ts         # Server actions for markdown rendering
│   └── page.tsx                 # Main dashboard with tabs (tasks/notes/dashboard)
├── components/
│   ├── notes/
│   │   ├── note-editor.tsx      # Note editing component with markdown preview
│   │   ├── note-list.tsx        # List of notes display
│   │   ├── note-list-item.tsx   # Individual note item component
│   │   └── project-notes-view.tsx  # Main notes view component
│   ├── nav-projects.tsx         # Project navigation in sidebar
│   └── app-sidebar.tsx          # Main app sidebar
├── hooks/
│   └── use-notes.ts            # Zustand store for notes state management
├── lib/
│   ├── notes-local-storage.ts  # LocalStorage operations for notes
│   └── stores/
│       ├── project-store.ts    # Zustand store for projects
│       ├── task-store.ts       # Zustand store for tasks (reference pattern)
│       └── types.ts            # Project and Task type definitions
└── types/
    └── note.ts                 # Note interface definition
```

### Relevant Modules

- **State Management**: Zustand with persist middleware for projects/tasks, Zustand without persist for notes
- **Storage**: localStorage for all data (no database - client-side only application)
- **UI Framework**: Next.js 14 (App Router), Shadcn UI, Radix UI
- **Key Libraries**: zustand, uuid/nanoid, date-fns, next-themes

### Key Files

1. `/Users/usuario1/Documents/me/ai/aitas/types/note.ts` - Note data model
2. `/Users/usuario1/Documents/me/ai/aitas/lib/notes-local-storage.ts` - Note persistence layer
3. `/Users/usuario1/Documents/me/ai/aitas/hooks/use-notes.ts` - Notes state management
4. `/Users/usuario1/Documents/me/ai/aitas/components/notes/project-notes-view.tsx` - Main UI component
5. `/Users/usuario1/Documents/me/ai/aitas/components/notes/note-list.tsx` - Notes list display
6. `/Users/usuario1/Documents/me/ai/aitas/lib/stores/types.ts` - Project interface definition
7. `/Users/usuario1/Documents/me/ai/aitas/app/page.tsx` - Main page showing notes usage

## Existing Patterns

### Data Model

**Note Interface** (`/Users/usuario1/Documents/me/ai/aitas/types/note.ts`):
```typescript
export interface Note {
    id: string;
    projectId: string;        // Currently REQUIRED - needs to be optional
    title: string;
    content: string;          // Markdown format
    createdAt: string;        // ISO string
    updatedAt: string;        // ISO string
}
```

**Project Interface** (`/Users/usuario1/Documents/me/ai/aitas/lib/stores/types.ts`):
```typescript
export interface Project {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

### Storage Pattern

**LocalStorage Key Pattern** (`/Users/usuario1/Documents/me/ai/aitas/lib/notes-local-storage.ts`):
```typescript
const getProjectNotesKey = (projectId: string): string => `project_notes_${projectId}`;
```

Currently stores notes in localStorage with keys like:
- `project_notes_${projectId}` - array of Note objects

Similar pattern exists for projects:
- `projects-storage` - Zustand persist storage for projects

### State Management Pattern

**Notes Store** (`/Users/usuario1/Documents/me/ai/aitas/hooks/use-notes.ts`):
- Uses Zustand WITHOUT persist middleware
- Loads notes from localStorage when projectId changes
- Key functions:
  - `loadNotes(projectId)` - Load notes for a specific project
  - `addNote(title, content, tempImageParentId?)` - Add new note
  - `updateNote(noteId, title, content)` - Update existing note
  - `deleteNote(noteId)` - Delete note
  - `selectNote(noteId)` - Select note for editing
  - `getNoteById(noteId)` - Retrieve specific note
  - `clearNotes()` - Clear all notes from state

**Projects Store** (`/Users/usuario1/Documents/me/ai/aitas/lib/stores/project-store.ts`):
- Uses Zustand WITH persist middleware
- Persists to localStorage automatically
- Similar CRUD pattern: addProject, updateProject, deleteProject, selectProject

### Code Conventions

- **File Naming**: kebab-case for component files (`note-list-item.tsx`)
- **Component Names**: PascalCase (`NoteEditor`, `ProjectNotesView`)
- **Type Definitions**: PascalCase interfaces in separate `types/` directory
- **Store Hooks**: `use-` prefix (`useNotesStore`, `useProjectStore`, `useTaskStore`)
- **Client Components**: All interactive components have `"use client"` directive
- **Server Actions**: In `app/actions/` with `"use server"` directive

### Testing Patterns

No test files found in the codebase - testing appears to be manual/not yet implemented.

## Current Implementation Details

### Note Display Flow

1. **Main Page** (`app/page.tsx`):
   - Uses hardcoded `MAIN_PAGE_PROJECT_ID = "main_dashboard_notes"`
   - Renders `<ProjectNotesView projectId={MAIN_PAGE_PROJECT_ID} />`
   - This is the "Notes" tab in the main dashboard

2. **Project Notes View** (`components/notes/project-notes-view.tsx`):
   - Receives `projectId` as prop
   - Loads notes on mount using `loadNotes(projectId)`
   - Uses ResizablePanel for desktop, Drawer for mobile
   - Left panel: NoteList component
   - Right panel: NoteEditor component

3. **Note List** (`components/notes/note-list.tsx`):
   - Displays all notes for current project from Zustand store
   - "New Note" button at top
   - Shows "No notes in this project. Create one!" when empty
   - Maps over notes array to render NoteListItem components

4. **Note Storage** (`lib/notes-local-storage.ts`):
   - Each project's notes stored separately in localStorage
   - Key format: `project_notes_${projectId}`
   - Notes are stored as JSON array per project

### Current Project-Note Relationship

**IMPORTANT FINDING**: Notes already have projectId field and are stored per-project!

However:
- The main dashboard uses a fake/hardcoded projectId: `"main_dashboard_notes"`
- There's no UI to view notes associated with actual projects from the sidebar
- Projects in sidebar don't show or access their associated notes
- The projectId field is REQUIRED but there's no option for standalone notes (projectId: null/undefined)

### Integration Points

**Where Projects are Displayed**:
- `components/nav-projects.tsx` - Sidebar navigation showing all projects
- Projects are clickable and filter tasks, but do NOT show notes
- Dropdown menu has: View Project, Share Project, Delete Project

**Where Notes are Displayed**:
- Only in main dashboard "Notes" tab (`app/page.tsx`)
- Uses hardcoded projectId, not real projects

**Task-Project Integration Pattern** (reference for implementation):
- Tasks have optional `projectId?: string` field
- Task store has `filters.projectId` for filtering by project
- When project selected in sidebar, tasks filter automatically
- Nav Projects component calls `setFilter("projectId", projectId)` on project select

## Constraints & Dependencies

### Tech Stack
- **Language**: TypeScript 5.8.3
- **Framework**: Next.js 15.4.0 (App Router, React 19.1.0)
- **State Management**: Zustand 5.0.3
- **UI Library**: Radix UI components, Shadcn UI
- **Styling**: Tailwind CSS 4.1.4
- **Build Tool**: Next.js with Turbopack
- **Storage**: Browser localStorage (no database)

### External Dependencies
- `zustand` - State management with persist middleware
- `uuid` / `nanoid` - ID generation
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `react-resizable-panels` - Split panel UI
- `vaul` - Drawer component for mobile

### Internal Dependencies
- Notes depend on Project structure (projectId reference)
- Notes use imageStorage for embedded images (IndexedDB)
- Notes use server action for markdown preview rendering

### Architectural Decisions
- **Client-side only**: No database, all data in localStorage/IndexedDB
- **Store separation**: Separate Zustand stores for Projects, Tasks, and Notes
- **Persistence strategy**: 
  - Projects: Zustand persist middleware (auto-save to localStorage)
  - Tasks: Zustand persist middleware (auto-save to localStorage)
  - Notes: Manual localStorage, loaded per-project on demand
- **Image handling**: Separate IndexedDB storage via imageStorage utility

## Implementation Approach

### Required Changes

1. **Update Note Type** (`types/note.ts`):
   - Make `projectId` optional: `projectId?: string`
   - Add comment explaining null/undefined means standalone note

2. **Update Storage Layer** (`lib/notes-local-storage.ts`):
   - Add new storage key for standalone notes: `standalone_notes`
   - Update `getNotesFromStorage` to handle optional projectId
   - Update `saveNoteToStorage` to handle optional projectId
   - Update `deleteNoteFromStorage` to handle optional projectId
   - Consider helper: `getStandaloneNotesKey()` returning `"standalone_notes"`

3. **Update Notes Store** (`hooks/use-notes.ts`):
   - Update `loadNotes` to accept optional projectId
   - Add `loadStandaloneNotes()` function
   - Modify `currentProjectId` to be nullable
   - Handle case where no project is selected (load standalone notes)

4. **Update UI Components**:
   - **ProjectNotesView**: Accept optional projectId, show standalone if null
   - **NoteList**: Update empty state message based on context (project vs standalone)
   - Consider adding visual indicator (icon/badge) to differentiate note types

5. **Update Main Page** (`app/page.tsx`):
   - Replace hardcoded `MAIN_PAGE_PROJECT_ID` with `null` or `undefined`
   - This makes the Notes tab show standalone notes by default

6. **Add Project Notes View** (NEW):
   - Option 1: Add "Notes" item to project dropdown menu in sidebar
   - Option 2: Add dedicated route for project notes (e.g., `/projects/[id]/notes`)
   - Option 3: Add notes section to project detail view
   - Recommended: Start with Option 1 (dropdown menu item)

7. **Visual Separation**:
   - Add header/title showing current context ("Standalone Notes" vs "Project: [name]")
   - Consider section dividers or separate lists if showing both in same view
   - Badge or icon on note items indicating if they belong to a project

### Migration Strategy

**Existing Notes**: 
- Notes stored under `"main_dashboard_notes"` key should be migrated to standalone notes
- One-time migration function to move these notes to `"standalone_notes"` key
- Run on first load after update (check localStorage for old key)

### UI Flow

**Standalone Notes (Default)**:
1. User opens app → Main dashboard → Notes tab
2. Displays standalone notes (projectId = null)
3. Can create/edit/delete standalone notes

**Project Notes**:
1. User clicks project in sidebar
2. Opens dropdown menu → "View Notes" option
3. Either:
   - Opens modal/drawer with ProjectNotesView for that project
   - Navigates to project notes page
   - Switches main view to project notes
4. Displays notes for that specific project
5. Can create/edit/delete project-specific notes

## Risk Assessment

- **Low Risk**: Type changes (projectId optional) - TypeScript will catch issues
- **Low Risk**: Storage layer updates - well-isolated functions
- **Medium Risk**: State management changes - need to test all note operations
- **Medium Risk**: UI updates - need to handle both standalone and project contexts
- **Medium Risk**: Migration - existing notes need to be preserved
- **Low Risk**: Breaking changes - localStorage is isolated per user

## Recommendations

### Suggested Implementation Order

1. **Phase 1 - Data Model** (Low risk, foundation):
   - Update Note interface (projectId optional)
   - Update storage functions to handle optional projectId
   - Add migration utility for existing notes

2. **Phase 2 - State Management** (Medium risk, core logic):
   - Update useNotesStore to handle optional projectId
   - Add loadStandaloneNotes function
   - Test CRUD operations for both types

3. **Phase 3 - UI Updates** (Medium risk, user-facing):
   - Update ProjectNotesView to handle optional projectId
   - Add context indicators (headers, badges)
   - Update empty states

4. **Phase 4 - Project Integration** (Low risk, enhancement):
   - Add "View Notes" to project dropdown
   - Implement project notes navigation
   - Add visual separation

5. **Phase 5 - Polish** (Low risk, UX):
   - Add ability to convert standalone → project note
   - Add ability to convert project → standalone note
   - Improve visual indicators

### Alternative Approaches

**Option A: Separate Stores**
- Create `useStandaloneNotesStore` and `useProjectNotesStore`
- Pros: Clear separation, easier to reason about
- Cons: Code duplication, more complex state management

**Option B: Single Store with Filter** (RECOMMENDED)
- Keep single `useNotesStore` with optional projectId
- Pros: Consistent with task store pattern, less code duplication
- Cons: Slightly more complex logic in store

**Option C: Projects as Special Type**
- Keep projectId required, create special "standalone" project
- Pros: No breaking changes to data model
- Cons: Feels like a hack, confusing UX

## Files to Review

Priority order for planner:

1. `/Users/usuario1/Documents/me/ai/aitas/types/note.ts` - Core data model
2. `/Users/usuario1/Documents/me/ai/aitas/lib/notes-local-storage.ts` - Storage layer
3. `/Users/usuario1/Documents/me/ai/aitas/hooks/use-notes.ts` - State management
4. `/Users/usuario1/Documents/me/ai/aitas/components/notes/project-notes-view.tsx` - Main UI
5. `/Users/usuario1/Documents/me/ai/aitas/components/notes/note-list.tsx` - List display
6. `/Users/usuario1/Documents/me/ai/aitas/app/page.tsx` - Main page usage
7. `/Users/usuario1/Documents/me/ai/aitas/components/nav-projects.tsx` - Project navigation
8. `/Users/usuario1/Documents/me/ai/aitas/lib/stores/types.ts` - Reference for Project type

## Unknowns

1. **UX Decision**: Should project notes be in a modal, separate page, or replace main view?
   - Recommendation: Start with modal/drawer for consistency with current UX
   
2. **Migration Timing**: When/how to migrate existing "main_dashboard_notes"?
   - Recommendation: Automatic migration on first load with new version
   
3. **Default Behavior**: When user clicks "New Note" in project context, should it default to project note?
   - Recommendation: Yes, maintain context - new note inherits current projectId

4. **Note Moving**: Should users be able to reassign notes between projects/standalone?
   - Recommendation: Phase 5 enhancement, not MVP requirement

---

**Research completed**: 2025-11-05
**Token efficient**: ✓ (Targeted reads, pattern analysis, no full file dumps)
