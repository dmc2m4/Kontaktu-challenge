import { describe, expect, it } from "vitest";
import { buildRecommendation, deriveContactRestrictions } from "@/lib/contacts/contact-policy";
import { validateContactDataset } from "@/lib/contacts/contact-validation";

function contact(fields: Record<string, unknown> = {}) {
  return validateContactDataset({ contacts: [{ id: "contact-1", ...fields }] }).contacts[0];
}

describe("contact restrictions", () => {
  it("blocks calls when consent is missing, even when a phone exists", () => {
    const restrictions = deriveContactRestrictions(contact({ phone: "+34 655 12 34 56" }), true);

    expect(restrictions.callConsent).toBe("unknown");
    expect(restrictions.callAllowed).toBe(false);
    expect(restrictions.callReasons).toContain("Call consent is not recorded.");
    expect(restrictions.whatsappAvailable).toBe(true);
  });

  it("blocks a clearly stated no-call or email-only preference in notes and interactions", () => {
    const noCall = deriveContactRestrictions(
      contact({
        phone: "+34 644 78 12 90",
        notes: "Contactar SOLO por email.",
        consent_to_call: true,
      }),
      true,
    );
    const interaction = deriveContactRestrictions(
      contact({
        phone: "+34 644 78 12 90",
        interactions: [{ content: "Por favor, dejen de contactarme por teléfono." }],
        consent_to_call: true,
      }),
      true,
    );

    expect(noCall.callAllowed).toBe(false);
    expect(noCall.noCallPreference).toBe(true);
    expect(noCall.whatsappAvailable).toBe(true);
    expect(interaction.callAllowed).toBe(false);
  });

  it("recognizes an explicit no-call tag and a clearly worded WhatsApp opt-out", () => {
    const noCallTag = deriveContactRestrictions(
      contact({ phone: "+34 644 78 12 90", tags: ["no-llamar"], consent_to_call: true }),
      true,
    );
    const whatsappOptOut = deriveContactRestrictions(
      contact({ phone: "+34 644 78 12 90", notes: "No quiero WhatsApp." }),
      true,
    );

    expect(noCallTag.callAllowed).toBe(false);
    expect(whatsappOptOut.whatsappAvailable).toBe(false);
  });

  it("blocks WhatsApp only when the contact clearly opted out or no phone is usable", () => {
    const allowed = deriveContactRestrictions(contact({ phone: "+34 655 12 34 56" }), true);
    const optedOut = deriveContactRestrictions(
      contact({
        phone: "+34 655 12 34 56",
        notes: "No quiero recibir mensajes por WhatsApp.",
      }),
      true,
    );
    const noPhone = deriveContactRestrictions(contact(), false);

    expect(allowed.whatsappAvailable).toBe(true);
    expect(optedOut.whatsappAvailable).toBe(false);
    expect(optedOut.whatsappOptOut).toBe(true);
    expect(noPhone.whatsappAvailable).toBe(false);
  });

  it("does not infer consent from a phone or previous outbound interaction", () => {
    const restrictions = deriveContactRestrictions(
      contact({
        phone: "+34 655 12 34 56",
        interactions: [{ direction: "outbound", content: "Previous message" }],
      }),
      true,
    );

    expect(restrictions.callConsent).toBe("unknown");
    expect(restrictions.callAllowed).toBe(false);
  });
});

describe("before-call recommendation", () => {
  it("prioritizes human handoff and never implies a blocked call is permitted", () => {
    const restrictions = deriveContactRestrictions(contact({ phone: "+34 655 12 34 56" }), true);

    expect(buildRecommendation(restrictions, true, true)).toBe(
      "Prioritize the requested human follow-up.",
    );
    expect(buildRecommendation(restrictions, false, true)).toBe(
      "Confirm call consent before calling.",
    );
  });
});