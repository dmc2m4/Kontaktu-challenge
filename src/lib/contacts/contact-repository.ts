import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeContactDetail, normalizeContactListItem } from "./contact-normalization";
import { validateContactDataset } from "./contact-validation";
import type { ContactDetail, ContactListItem } from "./contact-types";

async function readContactDataset() {
  try {
    const filePath = path.join(process.cwd(), "contactos.json");
    const source = await readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(source);
    return validateContactDataset(parsed);
  } catch {
    throw new Error("Contact data is unavailable or malformed");
  }
}

export async function getContactList(): Promise<ContactListItem[]> {
  const dataset = await readContactDataset();
  return dataset.contacts.map((contact) =>
    normalizeContactListItem(contact, dataset.organizationId),
  );
}

export async function getContactById(contactId: string): Promise<ContactDetail | null> {
  const dataset = await readContactDataset();
  const contact = dataset.contacts.find((candidate) => candidate.id === contactId);
  if (!contact) return null;
  return normalizeContactDetail(contact, dataset.organizationId);
}