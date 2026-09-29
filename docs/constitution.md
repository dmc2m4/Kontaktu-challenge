# Project Constitution

These principles apply to every change in this repository. Operational details (commands, structure, conventions) live in `AGENTS.md`. Product behavior lives in the active spec. Visual design rules live in `DESIGN.md` and their implementation tokens live in `tailwind.config.ts`.

## 1. Code Quality

* Write clear, maintainable, and readable code.
* Prefer simple solutions over unnecessary abstraction or complexity.
* Keep functions and components focused on a single responsibility.
* Avoid duplicated logic and premature abstractions.
* Do not leave dead code, unused imports, or unused variables.

## 2. Type Safety

* Use TypeScript strictly throughout the application.
* Prefer explicit, meaningful types.
* Avoid `any` unless there is a justified technical reason, documented in a comment.
* Do not use type assertions (`as SomeType`) or non-null assertions (`!`) to force types. Narrow with type guards, discriminated unions, or validation instead.
* `as const` and `satisfies` are allowed because they do not bypass type checking.
* Do not suppress TypeScript or ESLint errors (`@ts-ignore`, `@ts-expect-error`, `eslint-disable`) to bypass problems. If a suppression is truly unavoidable, it needs a specific rule name and a comment explaining why.

## 3. Architecture

* Keep a clear separation between presentation, business logic, data access, validation, and external integrations.
* Keep business logic out of presentation components whenever possible.
* Keep module dependencies explicit and avoid circular dependencies.
* Prefer composition and existing framework capabilities over unnecessary architectural patterns.

## 4. Data Integrity and Provenance

* Treat external and user-provided data as untrusted.
* Validate data at application boundaries. Prefer hand-written type guards; introduce a schema validation library only with a clear justification.
* Do not silently discard or fabricate data to make the UI look complete.
* Unknown or invalid fields are preserved and flagged as unrecognized. They are never deleted and never replaced with invented defaults.
* Missing values are represented explicitly (for example `null` or an absent field) and rendered as an explicit empty state, not as a placeholder that looks like real data.
* Preserve provenance when transforming data: at minimum the source channel, the original field name, the original value, and the source timestamp when available.
* Prefer deterministic and explainable data transformations. The same input must always produce the same output, and any derived value must be traceable to its source.
* Dates and times: parse them defensively, keep the original value, normalize to UTC internally, and render in a consistent time zone. Records with missing or invalid dates must still appear (for example in a clearly marked "undated" position) instead of being dropped from the timeline.

## 5. Security and Privacy

* Never expose secrets, credentials, or sensitive configuration in client-side code.
* Never commit secrets or `.env` files containing credentials.
* Use environment variables for sensitive configuration.
* Contact data (names, phone numbers, emails, messages) is personal data. Do not log it, do not include it in error messages, and send the client only the fields the UI needs.
* Data access happens on the server. Do not rely on UI restrictions as a security mechanism.
* If authentication or authorization is introduced (currently out of scope), it must be enforced on the server and follow the principle of least privilege. Do not add it on your own initiative.

## 6. User Experience and Accessibility

* Accessibility is a core requirement. The target is WCAG 2.2 level AA.
* Use semantic HTML first, and ARIA only when semantics are not enough.
* All interactive elements must be operable by keyboard, with a visible focus indicator.
* Text and interface elements must meet AA contrast requirements.
* Status changes (loading, errors, success) must be perceivable by assistive technologies.
* Provide appropriate loading, error, empty, not-found, and success states.
* Interfaces should be responsive when applicable.
* Maintain consistency with the project's design system defined in `DESIGN.md`.
* User-facing interactions should provide clear feedback.

## 7. Design System Integrity

* `DESIGN.md` is the authoritative source of truth for the application's visual design system.
* `tailwind.config.ts` is the single implementation layer for the design tokens defined by `DESIGN.md`.
* Components must consume design tokens through Tailwind rather than hardcoding visual values.
* Do not introduce arbitrary colors, typography, spacing, border radius, shadows, or other visual values when an equivalent design token exists.
* Do not create a parallel styling system that duplicates or conflicts with the design system.
* New reusable components must follow the established visual language and component guidelines in `DESIGN.md`.
* Any new design token must be justified and reflected consistently in both `DESIGN.md` and `tailwind.config.ts`.

## 8. Testing and Verification

* Data normalization and other deterministic business logic must have unit tests, including edge cases: missing fields, unknown fields, invalid values, and invalid dates.
* Do not consider a task complete while known lint, type-check, test, or build failures remain.
* Verify changes against the real provided dataset whenever possible.
* Review the final changes for unnecessary code, dependencies, configuration changes, and security issues.
* Report failures that already existed before your change instead of hiding them.

## 9. Error Handling and Logging

* Handle expected failures (missing contact, malformed record, unreadable data source) explicitly and show a meaningful user-facing state.
* Do not swallow errors silently. Either handle them meaningfully or let them propagate to the nearest error boundary.
* Logs must be useful for debugging without containing personal data.

## 10. Scope and Simplicity

* Implement only what is required for the current task.
* Avoid unrelated refactors.
* Do not introduce dependencies or infrastructure without a clear justification.
* Keep abstractions proportional to the complexity of the problem.
* Prefer incremental, focused changes over broad rewrites.
