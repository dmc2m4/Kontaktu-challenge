# Specification 001: Contact Detail

## Context and objective

Kontaktu receives real-estate contacts from calls, WhatsApp, forms, campaigns, imports, and manual entry. Each source may provide different fields, formats, and levels of detail; some records contain extensive qualification data, while others contain little more than a way to get in touch.

The objective is to let an agent open a contact record, quickly understand who the contact is, what information they have shared, and what happened in their interactions, then decide what to do without mistaking missing, unknown, or conflicting data for facts. The contact detail must be useful for both complete records and contacts with minimal data.

The functionality includes a simple list as an entry point. The contact detail is the primary focus.

## User

A real-estate agent reviewing a contact before starting or continuing a conversation, who needs to identify the contact, understand their intent, review their history, and respect their contact preferences.

## User stories

1. **Data health (#1).** As an agent, I want to know whether the contact has a usable way to reach them and any information about their real-estate intent, so I can see what is missing before working the lead. This story was selected because it makes basic readiness visible without requiring every record to be complete.
2. **"Before the call" view (#9).** As an agent, I want to review the contact's relevant details and recent context in a few seconds, so I can prepare for an informed conversation. This story was selected because it directly supports the main workflow of opening a record before reaching out, while keeping the summary grounded in available data.
3. **Compliance (#10).** As an agent, I want to recognize contact restrictions and have disallowed actions blocked, so I can respect recorded preferences. This story was selected because it prevents calls when consent is not recorded and prevents WhatsApp messages when the contact has rejected that channel.

## Functional requirements (FR-x)

- **FR-1 — Entry list.** The agent can view a simple list that identifies each contact, shows their source and most recent interaction when available, and allows the agent to open their contact detail. Every record in the supplied dataset is included. A record marked `is_test: true` is clearly labeled as a test contact. A contact whose `organization_id` differs from the export's organization ID remains included and is clearly marked with the discrepancy; the interface does not infer what the differing ID means.
- **FR-2 — Robust identity.** The contact detail displays the available name in a readable form; uppercase names may be presented with readable capitalization without changing the identity. If no name is available, it uses, in order, a readable phone number, an email address, and a neutral label indicating that the contact has no name. It displays an initials avatar when identifying text is available, a normalized source-channel label, a readable phone number, and the creation date when available. Source variants such as `VOICE_CALL`, `VOICE`, `VOZ`, and `llamada` are presented as the same voice-call channel; capitalization variants of WhatsApp are treated consistently. Website/form, Meta campaign, Witei import, and CRM import sources remain distinguishable. It does not present an invented value as real data.
- **FR-3 — Dynamic, traceable qualification.** The contact detail displays existing qualification facts without relying on a fixed list of fields. It handles qualification data supplied as an object or as valid JSON text, and facts both inside qualification groups and at the top level. When the information allows them to be identified, it groups them into purchase, rental, and common information. It retains and displays every unknown or unclassified contact fact, grouping it as unclassified rather than discarding it. It represents mixed value types (including lists, objects, numbers, booleans, and text) in an understandable way and distinguishes missing or empty values from actual values. Original values are never rejected or silently discarded; if a value is malformed or cannot be interpreted, it remains visible and is marked accordingly. Each displayed fact identifies its source and date when available. Recognizable synchronization metadata is not presented as a contact preference or qualification fact.
- **FR-4 — Human correction precedence.** When a human correction exists for the same fact as an AI-extracted value, the contact detail displays only the corrected value as current and indicates that it was edited by a person, along with its date if available. It does not display the previous AI value as a competing current qualification value. When multiple values conflict and none is a human correction, it displays all values with their available source and date and clearly identifies the discrepancy without selecting one as current. Historical interaction content may still describe what was said previously; that history must not override or contradict which value is identified as current.
- **FR-5 — Interaction history.** The contact detail brings calls, WhatsApp messages, and form submissions together in a timeline ordered by the actual time of each event, with the most recent interaction first, even when the original dates use different formats. Dates in this dataset include ISO timestamps with a `Z` timezone, Spanish day/month/year strings with or without a time, and Unix epoch timestamps in seconds. Dates and times are displayed in `Europe/Madrid`; timezone-less date/time strings are interpreted in that zone, while explicit UTC and epoch timestamps are converted to it for display. Date-only values remain date-only and are not given an invented time. Each call displays its summary and allows its transcript to be expanded or collapsed when available. Events without an interpretable date remain visible in a group labeled date unavailable; they are not discarded or interleaved as if their dates were known.
- **FR-6 — Before-the-call view.** The contact detail provides a compact view of available facts that help prepare for the conversation, such as the contact's intent, preferences, relevant context, handoff status, and most recent interaction. It may include a concise inferred recommendation, but clearly identifies it as a recommendation rather than a stated fact. Recommendations must be grounded in recorded facts or recent interactions, must respect consent and channel restrictions, and must not imply that an action is allowed when it is blocked. For example, a recorded request to speak to a human can support a human-follow-up recommendation. The view omits missing data and does not invent information to complete the summary.
- **FR-7 — Data health.** The contact detail separately indicates whether there is a usable way to contact the person and whether there is at least one meaningful piece of information about their real-estate intent. A contact method counts only if its value is present and syntactically usable; this does not imply verified deliverability. A malformed email address such as `mdolores@@gmail.com` does not count as a usable email address, but the original value remains visible and is marked as malformed. Phone numbers may appear with `+34`, `0034`, national digits, spaces, or hyphens; presentation readability does not require international normalization. Intent may be evidenced by structured preferences or qualification, campaign/form notes, or a specific request in an interaction. It considers both signals covered only when both are present; otherwise, it identifies which one is missing. The rest of the record does not need to be complete for the contact to be displayed.
- **FR-8 — Contact restrictions.** The contact detail visibly indicates recorded consent status and contact preferences, including explicit restrictions recorded in tags, notes, or interactions as well as structured data. If consent to call is absent, unknown, or explicitly denied, the call action is unavailable; consent must not be inferred from the presence of a phone number, the source channel, or a previous outbound interaction. A specific request not to be called also blocks calls, even if it is expressed as a channel preference such as "email only." If the contact has explicitly indicated that they do not want to receive WhatsApp messages, the WhatsApp action is unavailable. The absence of a WhatsApp restriction is not interpreted as a request not to use that channel. An unknown or missing status is distinguished from an explicit refusal.
- **FR-9 — Contact-detail states.** The experience communicates loading and error states, reports when the requested contact does not exist, and presents a contact with little or no data in a dignified way. For sparse records, it retains the available identity and information, explicitly identifies missing information when relevant, and does not fill sections with fabricated data.

## Acceptance criteria in EARS notation

- **AC-1 (FR-1, event-driven):** When the agent opens the list, the system shall display every contact in the supplied dataset with their identity, source, and most recent interaction when that data exists, and shall allow the agent to open each contact detail. It shall label `is_test: true` contacts as test records and identify organization-ID discrepancies without excluding those contacts.
- **AC-2 (FR-2, state-driven):** When a contact has no name, the system shall use the first available identifier in this order: phone number, email address, neutral label; it shall not present the neutral label as a real name.
- **AC-3 (FR-2, state-driven):** When identity, source, or creation-date data is missing, the system shall omit the nonexistent value or indicate that it is unavailable rather than fabricate a value.
- **AC-4 (FR-3, event-driven):** When a contact contains qualification facts in a nested group, at the top level, or in valid JSON text, the system shall display all contact facts, including unknown fields, and classify them as purchase, rental, common, or unclassified according to the available information.
- **AC-5 (FR-3, state-driven):** When a fact has a null, empty, non-scalar, or uncommon value type, the system shall represent it without deleting the fact or confusing a missing value with a real one.
- **AC-6 (FR-3, state-driven):** When a fact's source or date is unavailable, the system shall indicate that it is unavailable without attributing a source or date to it.
- **AC-7 (FR-4, state-driven):** When an AI value and a human correction exist for the same fact, the system shall display only the correction as current and identify its human source. When conflicting values exist without a human correction, it shall display them with available provenance and dates, flag the discrepancy, and not select one as current.
- **AC-8 (FR-5, event-driven):** When interactions have dates represented in different formats, including ISO timestamps, Spanish day/month/year strings, and Unix epoch seconds, the system shall order them according to the instants they represent, display the most recent first in `Europe/Madrid`, and include calls, WhatsApp messages, and forms in the same timeline.
- **AC-9 (FR-5, event-driven):** When an interaction is a call, the system shall display its summary if available and allow its transcript to be expanded and collapsed if available.
- **AC-10 (FR-5, state-driven):** When an interaction has no date or its date cannot be interpreted, the system shall keep it visible and identify its date as unavailable.
- **AC-11 (FR-6, event-driven):** When the agent opens the before-the-call view, the system shall display available facts useful for preparing the conversation and omit facts that are unavailable.
- **AC-12 (FR-6, state-driven):** When the before-the-call view includes an inferred recommendation, the system shall visually distinguish it from stated facts and shall not attribute it to the contact.
- **AC-13 (FR-6, state-driven):** When there is insufficient data to support a recommendation, the system shall not present one as certain or complete the contact detail with a fabricated recommendation.
- **AC-14 (FR-7, state-driven):** While data health is displayed, the system shall separately indicate the availability of a usable way to contact the person and the presence of meaningful information about their real-estate intent.
- **AC-15 (FR-7, state-driven):** When either or both health signals are missing, the system shall identify which one is missing; when both are present, it shall indicate that both signals are covered.
- **AC-16 (FR-8, state-driven):** When consent to call is absent, unknown, or explicitly denied, the system shall indicate the known status accurately and keep the call action blocked.
- **AC-17 (FR-8, state-driven):** When there is an explicit request not to receive WhatsApp messages, the system shall indicate it and keep the WhatsApp action blocked.
- **AC-18 (FR-8, state-driven):** When a channel's consent or preference status is unknown, the system shall display it as unknown, not as confirmed consent or refusal.
- **AC-19 (FR-9, event-driven):** When the requested contact does not exist, the system shall communicate that it was not found and provide an understandable way to return to the list.
- **AC-20 (FR-9, state-driven):** When the contact detail has little data or no interactions, the system shall continue to identify the contact using available fallbacks and display clear empty states without inventing data.
- **AC-21 (FR-9, event-driven):** When information cannot be loaded because of an error, the system shall report the error without including the contact's personal data in the message.
- **AC-22 (FR-8, state-driven):** When a contact's notes, tags, or interaction explicitly state "do not call" or "email only," the system shall block the call action and show the recorded preference without treating it as a WhatsApp opt-out.
- **AC-23 (FR-7, state-driven):** When a contact has a malformed email address and no other usable contact method, the system shall indicate that no usable contact method is available.
- **AC-24 (FR-3, state-driven):** When a contact field is malformed, unknown, or cannot be interpreted, the system shall retain and display its original value with an appropriate status rather than discard it.
- **AC-25 (FR-5, state-driven):** When a date/time has no explicit timezone, the system shall interpret it as `Europe/Madrid`; when a timestamp includes UTC or is an epoch value, the system shall display its corresponding time in `Europe/Madrid` without inventing a time for date-only values.

## Non-functional requirements

- Information shall be scannable for someone preparing a call under time pressure. Visual hierarchy shall prioritize identity, restrictions, and the summary ahead of extensive qualification details.
- The experience shall be usable on desktop, tablet, and mobile without hiding critical information or causing overlap.
- States, restrictions, and controls shall be perceivable and keyboard-operable; contrast and accessibility shall meet WCAG 2.2 AA.
- Personal data shall be displayed only when necessary for the task. Error messages shall not expose names, phone numbers, email addresses, conversations, or other personal data.
- Dates, normalized values, and labels shall be presented consistently, with an understandable distinction between original data, transformed data, missing data, and recommendations.
- Recommendations shall be explainable from available information and shall not hide or overwrite source facts.

## Edge cases

- Contact has no name, phone number, or email address: apply the identity fallback and distinguish it from a contact identified by name.
- Contact has no usable way to reach them: data health identifies this, and no action that cannot be carried out with available data is enabled.
- Contact has only an email address: the contact can still be identified and useful in the detail view, but is not presented as callable without a phone number. A malformed address such as `mdolores@@gmail.com` does not count as usable.
- Names are uppercase or irregularly formatted, as with `JOSÉ LUIS MARTÍN CABRERA` and `MARÍA DOLORES GUTIÉRREZ SANTOS`: display them readably without changing the person's identity or inventing parts of the name.
- Phone numbers have different formats, including `+34` with spaces or hyphens, `0034` prefixes, and Spanish national digits: preserve their meaning and display them readably. Do not offer a call action when usability cannot be established.
- Source channel is unknown or has an unrecognized label: preserve the recognizable information and present it as an unrecognized source, not as an invented channel.
- Qualification is empty or supplied as valid JSON text, contains top-level facts such as net income, or contains new keys, null values, lists, objects, booleans, or types that do not fit a usual presentation: do not discard contact facts; identify values that cannot be interpreted as unrecognized or valueless, and do not present recognizable synchronization metadata as a contact fact.
- Multiple values exist for a fact with no clear relationship: do not silently choose one or present one as certain; keep the values visible with their available sources and dates and identify the discrepancy. A human correction takes precedence as the sole current qualification value.
- A value has been corrected by a person and a previous value was extracted by AI, as with Roberto's budget: show only the manual correction as the current qualification value, while any historical interaction remains historical context.
- Creation, fact, or interaction dates are ISO timestamps, day/month/year strings, Unix epoch seconds, missing, or invalid: interpret supported formats consistently, do not invent dates, and keep events without interpretable dates visible as undated.
- Contact has no interactions, an empty transcript, or no call summary: maintain an explicit empty state and show only the available sections.
- Consent is missing or unknown: indicate that status and block the call. The dataset has no structured consent field, so consent cannot be inferred from a phone number or previous outbound message. A recorded no-call/email-only preference blocks calls; an explicit WhatsApp refusal blocks WhatsApp.
- Contact explicitly requests a channel preference in notes or an interaction, as with Sofía's email-only request: preserve and surface the preference, and apply the call restriction even though it is not stored in a dedicated consent field.
- Two records may describe the same person, as with Carmen Ruiz's differently formatted name and phone number: keep them as separate contacts because duplicate detection and merging are outside this scope.
- The dataset includes a record marked `is_test: true` and contacts from `ORG-0047` while the export identifies `ORG-0031`: include all of them, label the test record, and visibly note the organization-ID discrepancy without inferring its cause.
- Contact and intent data are incomplete: data health indicates each missing signal without presenting the detail as broken or invalid.
- Contact fails to load or a requested contact does not exist: distinguish between an error and a not-found state.

## Out of scope

- Detecting, grouping, or merging possible duplicate contacts.
- International phone-number normalization and call or WhatsApp launch actions as the full implementation of story #3. The contact detail must still display the phone number readably and apply the compliance restrictions in FR-8.
- General search and filtering across heterogeneous data in the list.
- Editing qualification facts from the contact detail, including validation and management of value history.
- An executive summary generated by a language model.
- Matching against the property catalog.
- A voice agent and the LiveKit bonus functionality.
- Implementing other challenge stories that were not selected. The brief recommendation in FR-6 is not a general next-best-action engine.
- Changes to the data source or the processes that generate, import, or correct contacts.

## Definition of done

- The list provides access to every contact in the supplied dataset and displays the required basic data when it exists; test records and organization-ID discrepancies are clearly marked rather than silently excluded.
- The contact detail supports both complete and sparse records, applies the defined fallbacks, and does not fabricate data.
- Qualification is displayed dynamically, unknown fields are retained, source and date are distinguished when available, and the agreed human precedence is applied.
- The history combines the required interaction types, is ordered by actual time with the most recent first, displays dates in `Europe/Madrid`, and retains events with uninterpretable dates.
- The before-the-call view is quick to understand, distinguishes facts from recommendations, and does not attribute inferences to the contact.
- Data health communicates the two agreed signals and identifies missing information.
- Consent and channel restrictions are indicated, and call or WhatsApp actions are blocked according to the agreed rules.
- Loading, error, not-found, and sparse-record states are distinguishable and accessible, and error messages do not reveal personal data.
- The experience meets the accessibility and responsive requirements in this specification.
- Open questions that affect data interpretation or product decisions are resolved before the functionality is considered complete.

## Open questions

None currently. All questions identified during specification review have been resolved with the product owner.
