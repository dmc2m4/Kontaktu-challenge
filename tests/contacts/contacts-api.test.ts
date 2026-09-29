import { describe, expect, it } from "vitest";
import { GET as getContacts } from "@/app/api/contacts/route";
import { GET as getContact } from "@/app/api/contacts/[contactId]/route";
import { isRecord } from "@/lib/contacts/contact-validation";

describe("contacts API", () => {
  it("returns all source contacts with list-safe fields and discrepancy markers", async () => {
    const response = await getContacts();
    const body: unknown = await response.json();
    if (!isRecord(body) || !Array.isArray(body.contacts)) {
      throw new Error("Contact list response is malformed");
    }
    const contacts = body.contacts.filter(isRecord);

    expect(response.status).toBe(200);
    expect(contacts).toHaveLength(16);
    expect(contacts.find((contact) => contact.id === "c-014")?.isTest).toBe(true);
    expect(contacts.find((contact) => contact.id === "c-010")?.organizationMismatch).toBe(true);
    expect(contacts[0]).not.toHaveProperty("notes");
    expect(contacts[0]).not.toHaveProperty("interactions");
  });

  it("returns Roberto's corrected budget and full detail fields", async () => {
    const response = await getContact(
      new Request("http://localhost/api/contacts/c-008"),
      { params: Promise.resolve({ contactId: "c-008" }) },
    );
    const body: unknown = await response.json();
    if (!isRecord(body) || !isRecord(body.contact)) {
      throw new Error("Contact detail response is malformed");
    }
    const qualificationFacts = body.contact.qualificationFacts;
    const interactions = body.contact.interactions;
    if (!Array.isArray(qualificationFacts) || !Array.isArray(interactions)) {
      throw new Error("Contact detail response is incomplete");
    }
    const budget = qualificationFacts
      .filter(isRecord)
      .find((fact) => fact.key === "budget");

    expect(response.status).toBe(200);
    expect(budget).toMatchObject({ originalValue: { max: 350000 }, humanEdited: true });
    expect(interactions).toHaveLength(2);
  });

  it("returns a distinct not-found response for an unknown contact ID", async () => {
    const response = await getContact(
      new Request("http://localhost/api/contacts/unknown"),
      { params: Promise.resolve({ contactId: "unknown" }) },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: { message: "Contact not found." } });
  });
});