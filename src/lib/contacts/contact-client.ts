import type {
  ContactDetail,
  ContactListItem,
  ContactMethod,
  NormalizedSource,
  ParsedContactDate,
} from "./contact-types";
import { isRecord } from "./contact-validation";

function isParsedContactDate(value: unknown): value is ParsedContactDate {
  return (
    isRecord(value) &&
    (value.kind === "instant" ||
      value.kind === "date-only" ||
      value.kind === "invalid" ||
      value.kind === "missing") &&
    (typeof value.timestamp === "number" || value.timestamp === null) &&
    (typeof value.dateKey === "string" || value.dateKey === null)
  );
}

function isNormalizedSource(value: unknown): value is NormalizedSource {
  return (
    isRecord(value) &&
    (typeof value.originalValue === "string" || value.originalValue === null) &&
    typeof value.label === "string" &&
    typeof value.recognized === "boolean"
  );
}

function isContactMethod(value: unknown): value is ContactMethod {
  return (
    isRecord(value) &&
    (typeof value.originalValue === "string" || value.originalValue === null) &&
    (typeof value.displayValue === "string" || value.displayValue === null) &&
    typeof value.usable === "boolean" &&
    typeof value.malformed === "boolean"
  );
}

function hasContactListItemShape(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.displayName === "string" &&
    (typeof value.initials === "string" || value.initials === null) &&
    isNormalizedSource(value.source) &&
    isContactMethod(value.phone) &&
    isContactMethod(value.email) &&
    isParsedContactDate(value.createdAt) &&
    (value.latestInteraction === null ||
      (isRecord(value.latestInteraction) &&
        isNormalizedSource(value.latestInteraction.channel) &&
        isParsedContactDate(value.latestInteraction.createdAt) &&
        (typeof value.latestInteraction.summary === "string" ||
          value.latestInteraction.summary === null))) &&
    typeof value.isTest === "boolean" &&
    (typeof value.organizationId === "string" || value.organizationId === null) &&
    (typeof value.exportOrganizationId === "string" || value.exportOrganizationId === null) &&
    typeof value.organizationMismatch === "boolean"
  );
}

export function isContactListItem(value: unknown): value is ContactListItem {
  return hasContactListItemShape(value);
}

export function parseContactListResponse(value: unknown): ContactListItem[] {
  if (!isRecord(value) || !Array.isArray(value.contacts)) {
    throw new Error("Contact list response is malformed");
  }

  const contacts: ContactListItem[] = [];
  for (const contact of value.contacts) {
    if (!isContactListItem(contact)) {
      throw new Error("Contact list response contains an invalid item");
    }
    contacts.push(contact);
  }
  return contacts;
}

export function isContactDetail(value: unknown): value is ContactDetail {
  return (
    isRecord(value) &&
    hasContactListItemShape(value) &&
    (typeof value.notes === "string" || value.notes === null) &&
    isRecord(value.handoff) &&
    typeof value.handoff.requested === "boolean" &&
    (typeof value.handoff.reason === "string" || value.handoff.reason === null) &&
    isParsedContactDate(value.handoff.requestedAt) &&
    isRecord(value.restrictions) &&
    typeof value.restrictions.callAllowed === "boolean" &&
    typeof value.restrictions.whatsappAvailable === "boolean" &&
    isRecord(value.dataHealth) &&
    typeof value.dataHealth.contactMethodAvailable === "boolean" &&
    typeof value.dataHealth.intentAvailable === "boolean" &&
    (typeof value.recommendation === "string" || value.recommendation === null) &&
    Array.isArray(value.qualificationFacts) &&
    Array.isArray(value.interactions)
  );
}

export async function fetchContactList(signal: AbortSignal): Promise<ContactListItem[]> {
  const response = await fetch("/api/contacts", { cache: "no-store", signal });
  if (!response.ok) throw new Error("Unable to load contacts");
  const body: unknown = await response.json();
  return parseContactListResponse(body);
}

export async function fetchContactDetail(
  contactId: string,
  signal: AbortSignal,
): Promise<ContactDetail | null> {
  const response = await fetch(`/api/contacts/${encodeURIComponent(contactId)}`, {
    cache: "no-store",
    signal,
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to load contact");
  const body: unknown = await response.json();
  if (!isRecord(body) || !isContactDetail(body.contact)) {
    throw new Error("Contact detail response is malformed");
  }
  return body.contact;
}