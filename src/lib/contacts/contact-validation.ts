import type { ContactDataset, RawContact } from "./contact-types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRawContact(value: unknown): value is RawContact {
  return isRecord(value) && typeof value.id === "string" && value.id.length > 0;
}

export function validateContactDataset(value: unknown): ContactDataset {
  if (!isRecord(value) || !Array.isArray(value.contacts)) {
    throw new Error("Contact dataset has an invalid structure");
  }

  const contacts: RawContact[] = [];
  for (const contact of value.contacts) {
    if (!isRawContact(contact)) {
      throw new Error("Contact dataset contains a record without a valid ID");
    }
    contacts.push(contact);
  }

  const organization = isRecord(value.organization) ? value.organization : null;
  const organizationId =
    organization && typeof organization.id === "string" ? organization.id : null;

  return { organizationId, contacts };
}

export function isUsablePhone(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const normalized = value.trim();
  if (!normalized || !/^\+?[\d\s().-]+$/.test(normalized)) return false;

  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function isUsableEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}