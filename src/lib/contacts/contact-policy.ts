import type { ContactRestrictions, RawContact } from "./contact-types";
import { isRecord } from "./contact-validation";

const NO_CALL_PATTERN =
  /\b(?:no[-_ ]llamar|no me llam(?:es|en)|dejen de llamarme|dejen de llamar|dejen de contactarme por tel[eé]fono|dejen de llamarla|no contactarme por tel[eé]fono|email only|solo por email|únicamente por email|solamente por email|contactar solo por email)\b/i;

const WHATSAPP_OPT_OUT_PATTERN =
  /\b(?:no quiero (?:recibir )?(?:(?:mensajes|mensajes por) )?whatsapp|no deseo (?:recibir )?(?:(?:mensajes|mensajes por) )?whatsapp|no me (?:escribas|contactes) por whatsapp|dejen de escribirme por whatsapp|no contactar por whatsapp)\b/i;

function explicitConsent(value: unknown): "granted" | "denied" | "unknown" {
  if (value === true) return "granted";
  if (value === false) return "denied";
  if (typeof value !== "string") return "unknown";

  const normalized = value.trim().toLowerCase();
  if (["granted", "yes", "true", "consented"].includes(normalized)) return "granted";
  if (["denied", "no", "false", "revoked"].includes(normalized)) return "denied";
  return "unknown";
}

function getRecordedText(contact: RawContact): string[] {
  const texts: string[] = [];
  if (typeof contact.notes === "string") texts.push(contact.notes);
  if (Array.isArray(contact.tags)) {
    for (const tag of contact.tags) {
      if (typeof tag === "string") texts.push(tag);
    }
  }
  if (Array.isArray(contact.interactions)) {
    for (const interaction of contact.interactions) {
      if (isRecord(interaction) && typeof interaction.content === "string") {
        texts.push(interaction.content);
      }
    }
  }
  return texts;
}

function getConsentStatus(contact: RawContact): ContactRestrictions["callConsent"] {
  const consentRecord = isRecord(contact.consent) ? contact.consent : null;
  const values = [
    contact.consent_to_call,
    contact.call_consent,
    consentRecord?.call,
  ];

  for (const value of values) {
    const status = explicitConsent(value);
    if (status !== "unknown") return status;
  }
  return "unknown";
}

export function deriveContactRestrictions(
  contact: RawContact,
  phoneUsable: boolean,
): ContactRestrictions {
  const recordedTexts = getRecordedText(contact);
  const noCallPreference = recordedTexts.some((text) => NO_CALL_PATTERN.test(text));
  const whatsappOptOut = recordedTexts.some((text) => WHATSAPP_OPT_OUT_PATTERN.test(text));
  const callConsent = getConsentStatus(contact);
  const preferences: string[] = [];

  if (noCallPreference) preferences.push("No se solicitaron llamadas telefónicas");
  if (recordedTexts.some((text) => /\bsolo por email|únicamente por email|email only\b/i.test(text))) {
    preferences.push("Solo correo electrónico");
  }
  if (whatsappOptOut) preferences.push("No se solicitaron mensajes por WhatsApp");

  const callReasons: string[] = [];
  if (!phoneUsable) callReasons.push("No hay un número de teléfono utilizable.");
  if (callConsent === "unknown") callReasons.push("No consta el consentimiento para llamar.");
  if (callConsent === "denied") callReasons.push("El consentimiento para llamar fue denegado.");
  if (noCallPreference) callReasons.push("El contacto solicitó explícitamente no recibir llamadas telefónicas.");

  const whatsappReasons: string[] = [];
  if (!phoneUsable) whatsappReasons.push("No hay un número de teléfono utilizable.");
  if (whatsappOptOut) whatsappReasons.push("El contacto rechazó explícitamente los mensajes por WhatsApp.");

  return {
    callConsent,
    callAllowed: phoneUsable && callConsent === "granted" && !noCallPreference,
    callReasons,
    noCallPreference,
    whatsappOptOut,
    whatsappAvailable: phoneUsable && !whatsappOptOut,
    whatsappReasons,
    preferences: [...new Set(preferences)],
  };
}

export function buildRecommendation(
  restrictions: ContactRestrictions,
  handoffRequested: boolean,
  hasRecentInboundInteraction: boolean,
): string | null {
  if (handoffRequested) return "Prioriza el seguimiento humano solicitado.";
  if (restrictions.noCallPreference) return "Respeta la preferencia de contacto registrada.";
  if (restrictions.callConsent !== "granted") return "Confirma el consentimiento para llamar antes de realizar la llamada.";
  if (hasRecentInboundInteraction) return "Revisa la última interacción entrante antes de responder.";
  return null;
}