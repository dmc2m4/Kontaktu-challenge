# Technical Plan: Contact Detail

## Scope and technical approach

Implement the approved requirements in `spec.md` only. Use the existing Next.js 16.3.6 App Router, React 19, TypeScript, and Tailwind CSS 4 project. Keep contact data access and normalization on the server, business rules in small domain modules, and rendering in focused UI components. Do not add a database, authentication, contact editing, duplicate merging, general search, property matching, LLM calls, or voice features.

The supplied root-level `contactos.json` remains the data source. A server-only repository reads it and exposes only the fields needed by the list or detail experience through Route Handlers. The client does not import or read the JSON file.

Prefer Server Components for route shells and static structure. Use Client Components only for browser fetch states and controls that need interaction. Use native links, buttons, and `<details>` where possible; transcript expand/collapse does not need a custom interaction framework.

## Architecture and data flow

1. The root list route renders a page shell and a contact-list data view.
2. The list view requests `GET /api/contacts`; its response contains list-safe fields only: contact ID, display identity, source label, creation date, most recent interaction summary/date, test flag, and organization-ID discrepancy marker.
3. Selecting a list entry navigates to `/contacts/[contactId]`. The dynamic route shell passes the contact ID to a detail data view, which requests `GET /api/contacts/[contactId]`.
4. Route Handlers call a server-only repository. The repository reads the JSON, validates its outer shape, preserves raw source values, and passes records to deterministic normalization and policy functions.
5. The API returns a typed presentation DTO that retains original values and provenance required by the UI. It does not return unrelated organization/contact fields.
6. The detail view composes identity, contact restrictions/actions, data health, the before-the-call summary, dynamic qualification, and the interaction timeline from that DTO.
7. A missing ID returns a not-found result. An unreadable or malformed source produces a sanitized server error response; errors and logs must not contain personal data.

Do not add artificial production latency. The browser request gives the page a real loading state; use local network throttling or a development-only delay only if needed to verify that state.

## Proposed file and folder structure

```text
src/
  app/
    api/
      contacts/
        route.ts
        [contactId]/
          route.ts
    contacts/
      [contactId]/
        page.tsx
        loading.tsx
        not-found.tsx
    error.tsx
    loading.tsx
    not-found.tsx
    page.tsx
    layout.tsx
    globals.css
  components/
    contacts/
      contact-list.tsx
      contact-list-row.tsx
    contact-detail/
      contact-detail-view.tsx
      contact-header.tsx
      contact-actions.tsx
      contact-restrictions.tsx
      data-health.tsx
      before-call-summary.tsx
      qualification-section.tsx
      qualification-fact.tsx
      interaction-timeline.tsx
      interaction-item.tsx
      contact-detail-skeleton.tsx
  lib/
    contacts/
      contact-repository.ts
      contact-validation.ts
      contact-normalization.ts
      contact-policy.ts
      date-time.ts
      contact-types.ts
  tests/
    contacts/
      contact-validation.test.ts
      contact-normalization.test.ts
      contact-policy.test.ts
      date-time.test.ts
      contacts-api.test.ts
vitest.config.mts
```

The proposed structure is a guide, not a requirement to create empty modules. Keep a concern in an existing module when it remains focused and easy to test. Do not create a component for every individual label or field.

## Components

- **Contact list and row:** show identity, normalized source, last interaction when present, a visible `Test` marker for `is_test: true`, and an organization discrepancy marker when a contact's organization ID differs from the export organization ID. Preserve separate records even when they may refer to the same person.
- **Contact detail view:** arrange the page sections and provide a dignified sparse-data composition.
- **Contact header:** show fallback identity, initials, source, readable phone, and creation date when available.
- **Contact action status and restrictions:** show contact methods and the server-derived allowed/blocked status and reason for call and WhatsApp. These are status-only controls in this scope: they do not initiate a phone call, use a `tel:` link, or open WhatsApp. They must never appear available based only on a phone number or prior outbound activity.
- **Data-health indicator:** report contact-method usability and presence of meaningful real-estate intent independently, and identify each missing signal.
- **Before-call summary:** prioritize known intent, preferences, latest interaction, and human handoff. Visually distinguish any deterministic recommendation from recorded facts and omit recommendations unsupported by the record.
- **Qualification section/fact:** render all contact facts dynamically, grouping purchase, rental, common, and unclassified facts. Preserve original keys/values and provenance for unknown or malformed fields.
- **Interaction timeline/item:** show calls, WhatsApp messages, and form submissions together; display call summaries and use native disclosure for transcripts.
- **Loading, error, not-found, and empty states:** reuse the same visual language and ensure that sparse data is an explicit state, not an error.

## API and data access

- `GET /api/contacts`: return all dataset contacts, including test records and contacts with a nonmatching organization ID. Include enough fields for the list and its discrepancy/test labels, but omit qualification details and full message bodies.
- `GET /api/contacts/[contactId]`: return one normalized detail DTO, including the fields required for identity, preferences, qualification, provenance, and the full interaction history/transcripts available in the source. Return not-found for an unknown ID.
- Keep the API read-only; the selected stories do not include editing or persistence.
- Mark the repository module as server-only and read the JSON from the project root. Validate the top-level structure and each record at the boundary without narrowing away unknown fields.
- Do not cache the contact GET responses for this prototype. The installed Next.js Route Handler documentation states handlers are not cached by default; the browser fetch should also request fresh data.
- Next.js 16 dynamic route and Route Handler `params` are asynchronous. Follow the installed version's `Promise` params convention and generated route types rather than synchronous examples from older Next.js versions.
- API error bodies and server logs must not include names, phone numbers, emails, notes, message bodies, or transcripts.

## Heterogeneous data handling

Keep parsing/normalization separate from UI rendering. Every normalization result must preserve the source key, original value, source/channel, and source timestamp when available.

- **Contact identity:** apply the specified name → readable phone → email → neutral-label fallback. Improve readability of uppercase display names without inventing or removing identity information. Keep the original source value available.
- **Sources:** normalize known aliases such as `VOICE_CALL`, `VOICE`, `VOZ`, and `llamada` to one voice-call label, and case variants of WhatsApp to one label. Keep website/form, Meta, Witei, and CRM sources distinct. Preserve unknown source strings and mark them unrecognized.
- **Test and organization markers:** retain all contacts. Label `is_test: true` as `Test`. Compare each `organization_id` with the export organization's ID and mark a mismatch as a discrepancy, without claiming why it exists.
- **Qualification:** accept object values and valid JSON text; inspect recognized `sale`, `rental`, and `shared` groups, plus other top-level contact facts. Preserve unknown keys and values. Do not render recognized synchronization metadata as qualification. Keep unsupported/malformed source data visible with an unrecognized or malformed status.
- **Corrections and conflicts:** identify `source: manual` as human-edited in this dataset. When a manual correction corresponds to an AI/client-extracted current fact, show only the manual value as current, with its provenance and date. When values conflict and no human correction exists, show all conflicting values with their available provenance/date and flag the discrepancy; do not select a winner by recency or discard a value. Historical interactions remain historical evidence rather than being rewritten as current qualification.
- **Contact usability:** never reject or delete a source value. Assess a phone/email for basic syntactic plausibility only; this does not verify deliverability. For example, retain `mdolores@@gmail.com`, mark it malformed, and do not count it as a usable email. Preserve the varied phone formats while displaying them readably; international normalization is outside scope.
- **Preferences and consent:** a clearly worded explicit preference in a tag, note, or interaction counts even without a structured field. Block calls when call consent is absent/unknown or a clear no-call/email-only preference is recorded. Block WhatsApp only when an explicit WhatsApp opt-out is recorded. Do not infer consent from a phone, source, or outbound message.
- **Dates:** support ISO timestamps with timezone, Spanish `DD/MM/YYYY` and `DD/MM/YYYY HH:mm` values, and Unix epoch seconds. Preserve the original value, convert interpretable instants to UTC internally, interpret timezone-less date/time values in `Europe/Madrid`, and render instants in `Europe/Madrid`. Date-only values remain date-only and appear within their calendar day in a `Time unavailable` subgroup, after interactions with exact times for that day. Put missing/unparseable events in a separate undated group; never drop them. Sort dated days newest first and timed interactions within each day newest first.
- **Recommendation:** use a small, deterministic, explainable rule set based only on explicit qualification, preferences, recent interaction, and handoff state. A recommendation must not override contact restrictions or appear as a fact. Do not use an LLM or generate a recommendation when the record provides no support.

## State handling and design

- List and detail fetches expose an accessible loading skeleton/status, a sanitized error state, and retry where a request can be repeated. A contact ID that does not exist is a distinct not-found state.
- Empty qualification and empty history have explicit, calm empty states. Missing values remain absent or are labeled unavailable; they are not replaced with examples or defaults.
- Disabled/blocked contact actions expose the reason in visible text, not color alone. Keyboard focus remains visible and controls are operable with keyboard.
- Use semantic headings, lists, buttons, links, and disclosure elements; announce asynchronous state changes appropriately. Verify WCAG 2.2 AA contrast, including badge text and disabled action states.
- Keep Tailwind CSS 4 and the repository's `tailwind.config.ts` as the single centralized design-token source. Explicitly load the legacy config from `src/app/globals.css` with Tailwind 4's `@config` directive, using the relative path to the root config. The installed Tailwind node loader resolves `.ts` configs through `jiti`; verify this path in the production build. Extend `tailwind.config.ts` to include every `DESIGN.md` token required by the UI. Do not duplicate the same token values in `@theme`, component CSS, or arbitrary Tailwind values.
- Replace starter fonts and page styling with Outfit headings and Inter body/control text from `DESIGN.md`. Preserve the Kontaktu warm canvas, orange high-intent actions, teal operational states, compact information hierarchy, and specified responsive gutters.
- The current `globals.css` uses Geist/Arial and system dark-mode colors, while the current `tailwind.config.ts` contains only a subset of `DESIGN.md` tokens. Remove the starter visual behavior as part of the UI implementation and verify that the explicit config load exposes the full token set to Tailwind 4.

## Testing strategy

The repository currently has no `test` script or test framework. Add Vitest with the Next.js-recommended React Testing Library/jsdom setup for deterministic domain tests and focused interactive-component tests. Keep all tests and descriptions in English. Because the local Next.js guide notes Vitest does not currently support async Server Components, cover page routing through build/smoke verification rather than forcing async route pages into unit tests.

- **Validation/normalization unit tests:** missing/null fields, unknown fields, upper-case names, absent identity fallbacks, source aliases and unknown sources, test/org markers, object and JSON-string qualification, top-level facts, mixed values, malformed email retained but not usable, and metadata handling.
- **Qualification policy unit tests:** manual correction wins as current; previous AI value is not current; conflicts without manual correction preserve and flag every value; unknown facts are retained.
- **Consent/action policy tests:** no consent blocks calls; clear no-call/email-only text blocks calls; WhatsApp remains unblocked unless a WhatsApp opt-out is explicit; consent is never inferred from a phone or outbound interaction.
- **Date/time unit tests:** ISO `Z`, timezone offsets, Spanish date and date-time strings, epoch seconds, date-only behavior, invalid/missing dates, DST transitions in `Europe/Madrid`, display zone conversion, and newest-first ordering.
- **API tests:** all supplied records are returned; test and organization-discrepancy markers are present; unknown ID is not-found; malformed/unreadable dataset is a sanitized error; list response omits detailed interaction content; detail response includes necessary source data.
- **Accessible UI checks:** sparse contact, status-only call/WhatsApp controls and blocked reasons (with no external navigation), keyboard-operable transcript disclosure, loading/error/not-found states, unknown qualification rendering, and small-screen layout.
- **Real-dataset verification:** smoke-test `c-001` (rich voice lead), `c-004` (WhatsApp-only sparse identity), `c-005` (email-only and local-form date), `c-008` (manual budget correction), `c-012` (minimal record and epoch creation date), `c-013` (no-call/email-only), `c-014` (test marker), `c-015` (malformed email/date), and `c-010`/`c-011` (organization discrepancy). Also verify the full list count against the JSON.

Add `npm run test` (and optionally `npm run test:watch`) to `package.json`; do not add a browser automation framework unless the implementation demonstrates a need beyond these checks.

## Recommended implementation order

1. Add the explicit Tailwind 4 `@config` reference to the root `tailwind.config.ts` from `globals.css`, complete the centralized token set, and verify generated utilities in a build.
2. Define strict boundary types and a server-only repository that reads the root JSON and reports malformed source data without logging PII.
3. Implement and unit-test deterministic parsing, source/name normalization, qualification flattening/provenance, conflict precedence, data-health computation, consent/channel policy, and date handling.
4. Add read-only list and detail Route Handlers, DTO minimization, HTTP not-found/error behavior, and API tests.
5. Replace the starter list page and create the dynamic contact-detail page with accessible loading, error, and not-found states.
6. Build the identity/header, contact restrictions/actions, data-health indicator, before-call summary, dynamic qualification, and timeline in that priority order. Apply the established tokens and responsive layout as each section is built.
7. Verify behavior against the real dataset and representative edge records, then run lint, tests, type-check, and production build.
8. Review the diff for personal-data leakage, discarded source values, invented fallbacks, accidental scope expansion, and design-token duplication.

## Verification criteria

- `npm run lint` completes successfully.
- `npm run test` covers deterministic normalization and policy/date edge cases.
- `npx tsc --noEmit` completes successfully.
- `npm run build` completes successfully with Next.js 16.3.6.
- The root list returns every JSON contact, visibly labels test records, and identifies organization-ID mismatches without excluding them.
- Selecting a list row opens the matching detail. Unknown IDs show not-found; data-source failures show a sanitized error.
- Representative full and sparse contacts render without crashes or fabricated data; unknown/malformed values remain visible.
- The manual budget correction is the current qualification, while uncorrected conflicts are retained and marked.
- Calls remain blocked without recorded consent and for clear no-call/email-only preferences; WhatsApp is blocked only for an explicit WhatsApp opt-out. Call and WhatsApp controls show status only and do not launch external actions.
- Dated interactions are newest first and displayed in `Europe/Madrid`; date-only values remain date-only in a `Time unavailable` subgroup after timed events on the same day; unparseable dates remain visible as undated.
- Keyboard operation, visible focus, accessible status communication, WCAG 2.2 AA contrast, and desktop/tablet/mobile layouts are checked.

## Clarifications resolved

- **Contact actions:** show availability/block state and reason, but do not initiate calls or open WhatsApp.
- **Date-only interactions:** keep the date without an invented time; place these entries in a `Time unavailable` subgroup after timed entries for the same day.
- **Tailwind:** keep Tailwind 4 and `tailwind.config.ts` as the centralized token source. Load the TypeScript config explicitly through Tailwind 4's `@config` directive from the global stylesheet; do not duplicate tokens in CSS.
