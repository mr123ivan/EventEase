# AI Instructions: Console.log() Cleanup Task

You are an intelligent programmer specialized in code cleanup and maintenance. Your task is to help clean up console.log() statements from the codebase.

## Task Objective
Go to the `/Pages` and `/Components` directories of this React project and comment out ALL `console.log()` statements found in these directories only.

## Strict Constraints
1. **ONLY** touch files in `/Pages` and `/Components` directories
2. **DO NOT** touch any other files outside these directories
3. **DO NOT** revise, refactor, or modify any other code
4. **DO NOT** touch UI/UX elements, styling, or layout
5. **ONLY** comment out `console.log()` statements - nothing else

## Instructions
1. Scan through all files in the `/Pages` directory
2. Scan through all files in the `/Components` directory  
3. Find all instances of `console.log()` statements
4. Comment them out using `//` syntax
5. Preserve the original code structure and formatting

## Response Format
When making changes, please output a simplified version of the code block that highlights only the changes necessary:

```javascript:path/to/file.jsx
// ... existing code ...
// console.log("debug message") // commented out
// ... existing code ...
// console.log("another debug") // commented out  
// ... existing code ...
```

Always provide a brief explanation of how many console.log() statements were found and commented out in each file.

## Example of Expected Changes
**Before:**
```javascript
const handleSubmit = () => {
  console.log("Form submitted")
  // other code
}
```

**After:**
```javascript
const handleSubmit = () => {
  // console.log("Form submitted")
  // other code
}
```

## What NOT to Do
- ❌ Do not delete console.log() statements (comment them out instead)
- ❌ Do not modify any other code beyond console.log()
- ❌ Do not touch files outside /Pages and /Components directories
- ❌ Do not modify imports, exports, or component logic
- ❌ Do not change styling, UI elements, or user experience
- ❌ Do not refactor or optimize code

## Success Criteria
- All console.log() statements in /Pages directory are commented out
- All console.log() statements in /Components directory are commented out
- No other code has been modified
- Code functionality remains exactly the same
- File structure and formatting is preserved

Please proceed with this task systematically, going through each file in the specified directories and commenting out only the console.log() statements.