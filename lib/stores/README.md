# Zustand Store for Eisenhower Matrix

This directory contains the Zustand store implementation for the Eisenhower Matrix application. The store manages the state of tasks, their positions in the matrix, and their completion status.

## Files

- `types.ts`: Type definitions for the store
- `task-store.ts`: The main Zustand store implementation with persist middleware
- `storage-utils.ts`: Utility functions for handling localStorage operations safely

## Store Structure

The store is structured as follows:

### State

- `tasks`: Array of tasks
- `selectedTaskIds`: Array of task IDs selected for AI ordering
- `isLoading`: Boolean indicating if the store is loading
- `error`: String containing error message or null

### Actions

- `addTask`: Add a new task
- `updateTask`: Update an existing task
- `deleteTask`: Delete a task
- `moveTask`: Move a task to a different quadrant
- `toggleTaskCompletion`: Toggle the completion status of a task
- `selectTask`: Select a task for AI ordering
- `deselectTask`: Deselect a task from AI ordering
- `clearSelectedTasks`: Clear all selected tasks
- `setError`: Set an error message
- `clearError`: Clear the error message

## Usage

To use the store in a component, import the `useTasks` hook from `lib/hooks/use-tasks.ts`:

```tsx
import { useTasks } from "@/lib/hooks/use-tasks";

function MyComponent() {
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useTasks();
  
  // Use the store actions
  const handleAddTask = () => {
    addTask({
      title: "New Task",
      description: "Task description",
      priority: "urgent",
    });
  };
  
  // ...
}
```

## Persistence

The store uses Zustand's persist middleware to automatically save the state to localStorage. The persistence is configured to:

- Only persist the `tasks` and `selectedTaskIds` parts of the state
- Use a unique name for localStorage to avoid conflicts
- Handle errors during storage operations
- Validate tasks after rehydration to ensure data integrity

## Error Handling

The store includes error handling for:

- localStorage quota exceeded
- Data inconsistencies during hydration
- General errors during store operations

## Future Improvements

- Add support for backend synchronization
- Implement task categories/tags
- Add task sorting options
- Implement task search functionality
- Add task statistics and analytics 