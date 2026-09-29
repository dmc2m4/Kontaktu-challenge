import { describe, expect, it } from "vitest";
import {
  formatQualificationValue,
  normalizeContactDetail,
  normalizeContactListItem,
} from "@/lib/contacts/contact-normalization";
import { validateContactDataset } from "@/lib/contacts/contact-validation";

function makeContact(fields: Record<string, unknown> = {}) {
  const dataset = validateContactDataset({
    organization: { id: "ORG-0031" },
    contacts: [{ id: "contact-1", ...fields }],
  });
  return { contact: dataset.contacts[0], organizationId: dataset.organizationId };
}

describe("contact identity and source normalization", () => {
  it("normalizes uppercase names and known source aliases", () => {
    const { contact, organizationId } = makeContact({
      full_name: "JOSÉ LUIS MARTÍN CABRERA",
      lead_source: "llamada",
      phone: "0034612889034",
    });
    const normalized = normalizeContactListItem(contact, organizationId);

    expect(normalized.displayName).toBe("José Luis Martín Cabrera");
    expect(normalized.initials).toBe("JC");
    expect(normalized.source.label).toBe("Llamada telefónica");
    expect(normalized.phone.displayValue).toBe("0034612889034");
  });

  it("uses phone, email, then a neutral identity fallback", () => {
    const withPhone = makeContact({ phone: "+34 655 12 34 56", email: "person@example.com" });
    const withEmail = makeContact({ email: "person@example.com" });
    const empty = makeContact();

    expect(normalizeContactListItem(withPhone.contact, null).displayName).toBe("+34 655 12 34 56");
    expect(normalizeContactListItem(withEmail.contact, null).displayName).toBe("person@example.com");
    expect(normalizeContactListItem(empty.contact, null).displayName).toBe("Unnamed contact");
    expect(normalizeContactListItem(empty.contact, null).initials).toBeNull();
  });

  it("retains unknown source labels and identifies test and organization discrepancies", () => {
    const { contact } = makeContact({
      lead_source: "new-source",
      organization_id: "ORG-0047",
      is_test: true,
    });
    const normalized = normalizeContactListItem(contact, "ORG-0031");

    expect(normalized.source.originalValue).toBe("new-source");
    expect(normalized.source.recognized).toBe(false);
    expect(normalized.isTest).toBe(true);
    expect(normalized.organizationMismatch).toBe(true);
  });
});

describe("qualification normalization", () => {
  it("flattens known groups and top-level facts from object data", () => {
    const { contact, organizationId } = makeContact({
      lead_source: "VOICE_CALL",
      qualification_data: {
        net_income: 3200,
        income_source: "declarado en llamada",
        income_updated_at: "2026-07-05T11:26:00Z",
        qualification: {
          sale: {
            budget: {
              value: { max: 350000 },
              source: "manual",
              updatedAt: "2026-07-10T09:15:00Z",
              sourceRef: "manual",
            },
            elevator: { value: "must have", source: "explicit" },
          },
          shared: { new_key: { value: ["raw", 2], source: "external" } },
          _meta: { lastSyncedAt: "2026-07-11T00:00:00Z" },
        },
      },
    });
    const detail = normalizeContactDetail(contact, organizationId);

    expect(detail.qualificationFacts.map((fact) => fact.key)).toEqual(
      expect.arrayContaining(["net_income", "budget", "elevator", "new_key"]),
    );
    expect(detail.qualificationFacts.some((fact) => fact.key === "lastSyncedAt")).toBe(false);
    expect(detail.qualificationFacts.find((fact) => fact.key === "budget")?.humanEdited).toBe(true);
    expect(detail.qualificationFacts.find((fact) => fact.key === "new_key")?.status).toBe("unrecognized");
    expect(detail.qualificationFacts.find((fact) => fact.key === "net_income")?.source).toBe(
      "declarado en llamada",
    );
  });

  it("parses valid JSON text and keeps malformed raw qualification visible", () => {
    const valid = makeContact({
      qualification_data:
        '{"qualification":{"rental":{"budget":{"value":1400,"source":"explicit"}}}}',
    });
    const invalid = makeContact({ qualification_data: "{not valid json" });

    expect(normalizeContactDetail(valid.contact, null).qualificationFacts[0].originalValue).toBe(1400);
    const malformed = normalizeContactDetail(invalid.contact, null).qualificationFacts[0];
    expect(malformed.originalValue).toBe("{not valid json");
    expect(malformed.status).toBe("malformed");
  });

  it("retains null, empty, mixed-type, and unknown values", () => {
    const { contact } = makeContact({
      qualification_data: {
        qualification: {
          sale: {
            zones: { value: null },
            budget: { value: "" },
            bedrooms: { value: 3 },
            custom_fact: { value: { label: "raw" } },
          },
        },
      },
    });
    const facts = normalizeContactDetail(contact, null).qualificationFacts;

    expect(facts.find((fact) => fact.key === "zones")?.status).toBe("null");
    expect(facts.find((fact) => fact.key === "budget")?.status).toBe("empty");
    expect(facts.find((fact) => fact.key === "custom_fact")?.originalValue).toEqual({ label: "raw" });
    expect(formatQualificationValue(["a", 2], true)).toBe("a, 2");
    expect(formatQualificationValue(false, true)).toBe("No");
  });

  it("shows only manual values as current and flags unresolved conflicts", () => {
    const { contact } = makeContact({
      qualification_data: {
        qualification: {
          sale: {
            budget: { value: 300000, source: "explicit" },
          },
        },
      },
      interest_preferences: { operation: "SALE", budget: 350000 },
    });
    const detail = normalizeContactDetail(contact, null);
    const budgetFacts = detail.qualificationFacts.filter((fact) => fact.key === "budget");

    expect(budgetFacts).toHaveLength(2);
    expect(budgetFacts.every((fact) => fact.conflict)).toBe(true);

    const corrected = makeContact({
      qualification_data: {
        qualification: {
          sale: {
            budget: { value: 300000, source: "explicit" },
          },
          purchase: {
            budget: { value: 350000, source: "manual" },
          },
        },
      },
    });
    const correctedBudget = normalizeContactDetail(corrected.contact, null).qualificationFacts.filter(
      (fact) => fact.key === "budget",
    );
    expect(correctedBudget).toHaveLength(1);
    expect(correctedBudget[0].originalValue).toBe(350000);
    expect(correctedBudget[0].humanEdited).toBe(true);
  });
});

describe("data health and sparse records", () => {
  it("keeps malformed emails visible but does not count them as usable", () => {
    const { contact } = makeContact({
      full_name: "Maria Example",
      email: "mdolores@@gmail.com",
      qualification_data: null,
      interactions: [],
    });
    const detail = normalizeContactDetail(contact, null);

    expect(detail.email.displayValue).toBe("mdolores@@gmail.com");
    expect(detail.email.malformed).toBe(true);
    expect(detail.dataHealth.contactMethodAvailable).toBe(false);
    expect(detail.dataHealth.intentAvailable).toBe(false);
  });

  it("counts specific inbound requests as intent and keeps dates without timestamps", () => {
    const { contact } = makeContact({
      full_name: null,
      phone: "+34 612 345 678",
      interactions: [
        {
          id: "interaction-1",
          channel: "WEB_FORM",
          direction: "inbound",
          created_at: "11/07/2026",
          content: "Me interesa este piso, ¿podría recibir más información?",
          metadata: { property_ref: "MIR-2041" },
        },
      ],
    });
    const detail = normalizeContactDetail(contact, null);

    expect(detail.displayName).toBe("+34 612 345 678");
    expect(detail.dataHealth.intentAvailable).toBe(true);
    expect(detail.interactions[0].createdAt.kind).toBe("date-only");
    expect(detail.interactions[0].metadata).toEqual({ property_ref: "MIR-2041" });
  });
});