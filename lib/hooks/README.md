# Hooks Documentation

## useMarkdownTextarea

A custom hook that provides image pasting and drag-and-drop functionality for markdown text areas.

### Features

- **Image Pasting**: Paste images directly from clipboard using Ctrl+V/Cmd+V
- **Drag & Drop**: Drag and drop image files into the textarea
- **Markdown Integration**: Automatically converts images to markdown syntax
- **Storage Integration**: Uses IndexedDB for local image storage
- **Loading States**: Shows upload progress and initialization status
- **Error Handling**: Graceful handling of upload failures

### Usage

```typescript
import { useMarkdownTextarea } from '@/lib/hooks/use-markdown-textarea';

const {
    textareaRef,
    isUploading,
    isStorageReady,
    handlePaste,
    handleDrop,
    handleDragOver,
    insertAtCursor,
} = useMarkdownTextarea({
    taskId: 'task-123',
    value: description,
    onChange: setDescription,
    onImageUpload: (imageId) => console.log('Uploaded:', imageId),
});
```

### Parameters

- `taskId`: Unique identifier for the task
- `value`: Current textarea value
- `onChange`: Function to update the textarea value
- `onImageUpload`: Optional callback when image upload completes

### Returns

- `textareaRef`: Ref to attach to the textarea element
- `isUploading`: Boolean indicating if an upload is in progress
- `isStorageReady`: Boolean indicating if image storage is initialized
- `handlePaste`: Event handler for paste events
- `handleDrop`: Event handler for drop events
- `handleDragOver`: Event handler for dragover events
- `insertAtCursor`: Function to insert text at cursor position

## MarkdownTextarea Component

A ready-to-use textarea component with built-in image pasting support.

### Usage

```typescript
import { MarkdownTextarea } from '@/components/ui/markdown-textarea';

<MarkdownTextarea
    taskId="task-123"
    value={description}
    onChange={setDescription}
    placeholder="Type your description... (Paste images directly!)"
    onImageUpload={(imageId) => console.log('Uploaded:', imageId)}
/>
```

### Features

- All features from `useMarkdownTextarea`
- Visual loading indicators
- Enhanced placeholder text
- Disabled state during initialization
- Upload progress indicator
- Image support hint

### Image Flow

1. User pastes/drops an image
2. Placeholder text is inserted: `![Uploading filename.ext...]()`
3. Image is uploaded to IndexedDB
4. Image is added to task store
5. Placeholder is replaced with: `![filename.ext](blob:url)`
6. Image appears in markdown preview

### Supported Image Formats

- PNG
- JPEG/JPG
- GIF
- WebP
- BMP

### Error Handling

- Failed uploads show: `![Upload failed]()`
- Storage initialization errors are logged
- Network errors are handled gracefully 