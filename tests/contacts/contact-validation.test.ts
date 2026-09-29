import { describe, expect, it } from "vitest";
import {
  isRecord,
  isUsableEmail,
  isUsablePhone,
  validateContactDataset,
} from "@/lib/contacts/contact-validation";

describe("contact boundary validation", () => {
  it("accepts a dataset and retains its contact records", () => {
    const dataset = validateContactDataset({
      organization: { id: "ORG-1" },
      contacts: [{ id: "contact-1", extraField: { keep: true } }],
    });

    expect(dataset.organizationId).toBe("ORG-1");
    expect(dataset.contacts).toHaveLength(1);
    expect(dataset.contacts[0].extraField).toEqual({ keep: true });
  });

  it("rejects an invalid outer shape and records without IDs", () => {
    expect(() => validateContactDataset(null)).toThrow("invalid structure");
    expect(() => validateContactDataset({ contacts: [null] })).toThrow("without a valid ID");
  });

  it("narrows plain records without accepting arrays or null", () => {
    expect(isRecord({ value: 1 })).toBe(true);
    expect(isRecord([1])).toBe(false);
    expect(isRecord(null)).toBe(false);
  });
});

describe("contact method syntax checks", () => {
  it.each(["+34 655 12 34 56", "0034612889034", "699112233", "+34-644-556-677"])(
    "accepts a plausible phone format: %s",
    (phone) => expect(isUsablePhone(phone)).toBe(true),
  );

  it.each(["", "1234", "call me", "++34655123456"])(
    "rejects an implausible phone format: %s",
    (phone) => expect(isUsablePhone(phone)).toBe(false),
  );

  it("retains malformed email values as data while reporting them unusable", () => {
    expect(isUsableEmail("lucia.fdz@gmail.com")).toBe(true);
    expect(isUsableEmail("mdolores@@gmail.com")).toBe(false);
    expect(isUsableEmail(null)).toBe(false);
  });
});