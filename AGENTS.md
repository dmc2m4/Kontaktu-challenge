<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Kontaktu Contact Challenge

## Project

Technical challenge for Kontaktu: a contact detail experience for an AI-first real-estate CRM.

Built with **Next.js (App Router), React, TypeScript, and Tailwind CSS**. The main focus is the contact detail page and its ability to handle heterogeneous, incomplete, and dynamic contact data.

## Commands

* Install dependencies: `npm install`
* Run development server: `npm run dev`
* Build for production: `npm run build`
* Start production server: `npm run start`
* Run tests: `npm run test`
* Run tests in watch mode: `npm run test:watch`
* Run lint: `npm run lint`
* Type-check: `npx tsc --noEmit`

Testing commands may be updated as the project's testing stack is configured.

## Style and Conventions

### Language

* Use **TypeScript** as the primary programming language.
* **All code must be written in English.**
* This includes variable names, function names, component names, hooks, types, interfaces, enums, constants, file names, folder names, routes, API endpoints, database fields, Prisma models, comments, logs, test descriptions, and commit messages.
* Never use Spanish names inside the codebase, even when the corresponding business terminology is in Spanish.
* Use clear, descriptive, and consistent English technical terminology.
* Technical documentation should be written in English.
* User-facing content may be written in Spanish when required by the product.

### TypeScript

* Avoid `any` whenever a properly typed alternative exists.
* Prefer explicit and meaningful types.
* Use TypeScript's type system to prevent runtime errors.
* Define shared types when they improve clarity and maintainability.
* Avoid unnecessary type assertions.

### React and Next.js

* Use the **Next.js App Router**.
* Prefer Server Components unless client-side interactivity or browser APIs require a Client Component.
* Use `"use client"` only when necessary.
* Keep React components small, focused, and reusable.
* Avoid placing complex business logic directly inside UI components.
* Use Server Actions or Route Handlers when appropriate.
* Prefer native Next.js and React capabilities before introducing external libraries.
* Follow Next.js conventions for routing, layouts, loading states, error handling, and metadata.
* Use the React Compiler and avoid unnecessary manual optimizations such as `useMemo`, `useCallback`, or `memo` unless they provide a measurable or meaningful benefit.
* Before implementing or modifying Next.js-specific functionality, consult the relevant documentation available in `node_modules/next/dist/docs/` when applicable.

### Architecture

Maintain a clear separation of responsibilities between:

* UI and presentation components.
* Business logic.
* Data access.
* Validation.
* External integrations.
* Infrastructure concerns.

Additional rules:

* Keep business logic out of presentation components whenever possible.
* Avoid duplicated logic.
* Prefer composition over unnecessary inheritance.
* Keep module dependencies explicit and simple.
* Avoid circular dependencies.
* Keep abstractions proportional to the complexity of the problem.
* Do not introduce architectural patterns simply for the sake of abstraction.

### Database

* Use **PostgreSQL** as the primary database.
* Use **Prisma** as the ORM.
* Database schema changes must be made through Prisma migrations.
* Never modify the production database manually.
* Review migrations before applying them to production.
* Avoid unnecessary database queries.
* Pay particular attention to N+1 query problems.
* Use appropriate indexes for frequently queried fields.
* Keep database access isolated from presentation logic.
* Never commit database credentials or secrets to the repository.

### Naming

* React components: `PascalCase`
* Variables and functions: `camelCase`
* Types and interfaces: `PascalCase`
* Enums: `PascalCase`
* Constants: `UPPER_SNAKE_CASE` when appropriate
* Files and folders: use the project's established naming convention consistently.
* API routes: follow RESTful and Next.js conventions where applicable.
* Database tables and fields: use consistent English naming conventions.

### Code Quality

* Prefer readable and maintainable code over clever implementations.
* Keep functions focused on a single responsibility.
* Avoid premature abstractions.
* Avoid unnecessary duplication.
* Prefer early returns when they improve readability.
* Handle errors explicitly.
* Do not suppress TypeScript or ESLint errors without a valid reason.
* Do not leave dead code, unused imports, or unused variables.
* Comments should explain **why** something is done, not simply describe what the code does.

## Rules

* Read `docs/constitution.md` and the active specification before modifying code.
* Read the relevant Next.js documentation in `node_modules/next/dist/docs/` before modifying Next.js-specific functionality.
* Do not modify or remove the `nextjs-agent-rules` block generated by Next.js.
* Do not modify or remove existing functionality without understanding its purpose.
* Keep changes focused on the requested task.
* Do not introduce unrelated refactors.
* Do not add new dependencies without first considering whether the existing stack can solve the problem.
* Prefer native Next.js, React, and TypeScript capabilities before adding third-party libraries.
* Never use `any` as a shortcut to resolve type errors.
* Never disable ESLint or TypeScript checks to bypass errors.
* Do not ignore build, lint, type-check, or test failures.
* Do not add functionality that was not requested without discussing it first.
* Do not modify global project configuration without considering its impact on the rest of the application.
* Do not expose secrets, API keys, credentials, or sensitive information in source code.
* Use environment variables for secrets and environment-specific configuration.
* Never expose server-only secrets to client-side code.
* Environment variables containing secrets must never use the `NEXT_PUBLIC_` prefix.
* Do not make direct production changes during development.
* Validate data received from users and external services.
* Never rely exclusively on client-side validation for security.
* Authentication and authorization must always be enforced on the server.
* Do not assume that hiding a UI element provides security.
* Consider accessibility when creating or modifying UI components.
* Build responsive interfaces when the feature requires it.
* Provide appropriate loading, error, empty, and success states.
* Destructive actions should require confirmation when appropriate.

## Security

* Never expose secrets or credentials in client-side code.
* Never commit `.env` files containing secrets.
* Use environment variables for sensitive configuration.
* Validate all external and user-provided input at application boundaries.
* Enforce authentication and authorization on the server.
* Do not return sensitive information unnecessarily from APIs or Server Actions.
* Use Prisma or properly parameterized queries to prevent SQL injection.
* Review external integrations carefully before trusting their data.
* Follow the principle of least privilege when implementing permissions.

## UI/UX

* Maintain a consistent visual language throughout the application.
* Prefer reusable UI components over duplicated implementations.
* Use Tailwind CSS consistently with the existing design system.
* Prioritize accessibility and responsive design.
* Forms must provide clear validation and error feedback.
* Provide clear loading and empty states.
* Destructive actions should require confirmation when appropriate.
* Avoid introducing isolated styles that conflict with the existing design system.
* User-facing text should be consistent in language, terminology, and tone.

## Git

* Keep commits small and focused.
* Write commit messages in English.
* Do not commit `.env` files, credentials, secrets, generated files, or unnecessary artifacts.
* Do not commit code with known TypeScript, lint, or test failures.
* Do not rewrite shared Git history without explicit authorization.

## Before Completing Any Task

Before considering a task complete:

1. Run lint:

   `npm run lint`

2. Run the test suite:

   `npm run test`

3. Run the TypeScript type-check:

   `npx tsc --noEmit`

4. If the task affects the production build, run:

   `npm run build`

5. Review all changes and remove unnecessary code, imports, files, or dependencies.

6. Verify that no secrets or sensitive configuration were added to the repository.

7. Confirm that the implementation follows the project's architecture and conventions.

8. Report what was changed, what verification commands were executed, and any known remaining issues.