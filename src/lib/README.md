# Macro Hover System

This module provides build-time macro detection and hover popup functionality for RPM documentation.

## Architecture

```
src/lib/
├── macro-data.ts           # Macro data as script tag
├── macro-detect.ts         # Macro detection utilities
├── rehype-macro-hover.js   # Build-time AST transformation
├── remark-macro-hover.js   # Client-side interaction script
└── README.md               # This file
```

## Pipeline

1. **Build Time** (`rehype-macro-hover.js`)
   - Runs during Astro MDX compilation
   - Transforms macro text (`%name`, `%{name}`, `%{name:arg}`) into hoverable HTML
   - Skips macros in headings
   - Generates unique popup IDs

2. **Build Time** (`remark-macro-hover.js`)
   - Injects client-side JavaScript for popup behavior
   - Handles mouse/focus events
   - Portals popups to `<body>` for fixed positioning

3. **Runtime**
   - Popups shown on hover/focus with 300ms delay on hide
   - Popup positioned fixed relative to trigger element
   - Links in popups remain clickable

## Macro Patterns Supported

- `%name` - Simple macro (e.g., `%define`)
- `%{name}` - Macro with braces (e.g., `%{dnl}`)
- `%{name:arg}` - Macro with argument (e.g., `%{expr:1+2}`)

## Data Structure

```typescript
interface MacroData {
  name: string;
  fullName: string;
  category: string;
  tags: string[];
  description: string;
  details?: string;
  expansion?: string;
  examples?: Array<{
    code: string;
    expansion: string;
  }>;
  parameterized?: boolean;
}
```

## Usage

```javascript
import { rehypeMacroHover } from './lib/rehype-macro-hover';
import { remarkMacroHover } from './lib/remark-macro-hover';

export default {
  markdown: {
    rehypePlugins: [rehypeMacroHover],
  },
  remarkPlugins: [remarkMacroHover],
};
```

## Files

### macro-data.ts
Exports `macroDataScript` - wraps macro JSON in `<script>` tag for client access.

### macro-detect.ts
TypeScript utilities for macro operations:
- `detectMacros(text)` - Find macros in string
- `getMacroByName(name)` - Get single macro
- `searchMacros(query)` - Search macros
- `getMacrosByCategory(category)` - Filter by category
- `getMacrosByTag(tag)` - Filter by tag

### rehype-macro-hover.js
Rehype plugin for AST transformation. Key exports:
- `createMacroElement()` - Creates hover wrapper AST
- `rehypeMacroHover()` - Main plugin function

### remark-macro-hover.js
Remark plugin that injects popup interaction JavaScript.

## CSS Classes

```css
.macro-hover-wrapper    /* Outer container */
.macro-trigger          /* Clickable macro text */
.macro-popup            /* Hidden popup */
.macro-popup-header     /* Title and tags */
.macro-popup-title      /* Macro name in popup */
.macro-popup-tags       /* Tag badges */
.macro-popup-description /* Macro description */
.macro-popup-expansion  /* Expansion example */
.popup-link             /* "View full documentation" link */
```
