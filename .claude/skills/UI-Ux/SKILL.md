```markdown
# UI-Ux Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns used in the UI-Ux repository, a TypeScript codebase focused on user interface and user experience logic. The repository does not use a specific framework, relying instead on native TypeScript and custom conventions for organizing and exporting code. You'll learn file naming conventions, import/export patterns, and how to structure and run tests.

## Coding Conventions

### File Naming
- **PascalCase** is used for file names.
  - Example:  
    ```
    UserProfile.ts
    LoginForm.test.ts
    ```

### Import Style
- **Relative imports** are used throughout the codebase.
  - Example:
    ```typescript
    import { UserProfile } from './UserProfile';
    ```

### Export Style
- **Named exports** are preferred.
  - Example:
    ```typescript
    // In UserProfile.ts
    export function UserProfile() { ... }
    ```

### Commit Patterns
- Commits use freeform messages, sometimes with prefixes.
- Average commit message length: 27 characters.

## Workflows

### Adding a New Component
**Trigger:** When you need to add a new UI component  
**Command:** `/add-component`

1. Create a new file using PascalCase (e.g., `NewComponent.ts`).
2. Implement the component logic using TypeScript.
3. Use named exports for all exported members.
4. Import the component where needed using a relative import.
5. (Optional) Add a corresponding test file: `NewComponent.test.ts`.

### Writing a Test
**Trigger:** When you need to add or update tests  
**Command:** `/write-test`

1. Create a test file named after the component, using the pattern `ComponentName.test.ts`.
2. Write your test cases in TypeScript.
3. Use the same named export/import conventions as production code.
4. Run your tests using the project's test runner (framework unknown; see project documentation or package.json for details).

## Testing Patterns

- **Test File Pattern:**  
  Test files follow the `*.test.*` pattern and are written in TypeScript.
  - Example:  
    ```
    LoginForm.test.ts
    ```
- **Testing Framework:**  
  The specific testing framework is not detected. Check the repository's documentation or configuration files for details.

## Commands
| Command         | Purpose                                      |
|-----------------|----------------------------------------------|
| /add-component  | Scaffold a new UI component with conventions |
| /write-test     | Create or update a test file                 |
```