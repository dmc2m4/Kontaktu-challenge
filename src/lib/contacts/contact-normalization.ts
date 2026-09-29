import {
  compareContactDatesDescending,
  formatContactDate,
  parseContactDate,
} from "./date-time";
import { buildRecommendation, deriveContactRestrictions } from "./contact-policy";
import { isRecord, isUsableEmail, isUsablePhone } from "./contact-validation";
import type {
  ContactDetail,
  ContactListItem,
  ContactMethod,
  DataHealth,
  NormalizedInteraction,
  NormalizedSource,
  QualificationFact,
  QualificationGroup,
  RawContact,
} from "./contact-types";

const KNOWN_FACTS = new Set([
  "zones",
  "budget",
  "budget_max",
  "budget_min",
  "bedrooms",
  "bedrooms_min",
  "bedrooms_max",
  "financing",
  "terrace",
  "has_pets",
  "urgency",
  "floor_pref",
  "elevator",
  "orientation",
  "garage",
  "accesibilidad_movilidad_reducida",
  "net_income",
  "income_verified",
  "operation",
]);

const METADATA_KEYS = new Set([
  "_meta",
  "lastSyncedAt",
  "lastSource",
  "income_source",
  "income_updated_at",
]);

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function titleCaseName(value: string): string {
  const trimmed = value.trim();
  const upper = trimmed === trimmed.toLocaleUpperCase("es-ES");
  const lower = trimmed === trimmed.toLocaleLowerCase("es-ES");
  if (!upper && !lower) return trimmed;

  return trimmed
    .toLocaleLowerCase("es-ES")
    .split(/([\s-]+)/)
    .map((part) => {
      if (/^[\s-]+$/.test(part)) return part;
      const [first, ...rest] = part;
      return `${first?.toLocaleUpperCase("es-ES") ?? ""}${rest.join("")}`;
    })
    .join("");
}

function getInitials(value: string | null): string | null {
  if (!value) return null;
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toLocaleUpperCase("es-ES");
  }
  const letters = words[0].match(/[\p{L}\d]/gu) ?? [];
  return letters.slice(0, 2).join("").toLocaleUpperCase("es-ES") || null;
}

function normalizeSource(value: unknown, kind: "lead" | "interaction" = "lead"): NormalizedSource {
  const originalValue = getString(value);
  const normalized = originalValue?.trim().toUpperCase() ?? "";
  const labels: Record<string, string> = {
    VOICE_CALL: "Phone call",
    VOICE: "Phone call",
    VOZ: "Phone call",
    LLAMADA: "Phone call",
    WHATSAPP: "WhatsApp",
    WEBSITE: "Website",
    WEB_FORM: "Web form",
    META_LEAD_ADS: "Meta Lead Ads",
    WITEI: "Witei import",
    CRM: "CRM import",
    EMAIL: "Email",
  };

  const label = labels[normalized];
  if (label) return { originalValue, label, recognized: true };
  if (!originalValue) return { originalValue: null, label: "Source unavailable", recognized: false };
  return {
    originalValue,
    label: `Unrecognized ${kind === "lead" ? "source" : "channel"}: ${originalValue}`,
    recognized: false,
  };
}

function normalizeMethod(value: unknown, kind: "phone" | "email"): ContactMethod {
  const originalValue = getString(value);
  const usable = kind === "phone" ? isUsablePhone(value) : isUsableEmail(value);
  return {
    originalValue,
    displayValue: originalValue,
    usable,
    malformed: originalValue !== null && !usable,
  };
}

function normalizeGroup(group: string): QualificationGroup {
  const normalized = group.toLowerCase();
  if (["sale", "sales", "purchase", "buy"].includes(normalized)) return "purchase";
  if (["rental", "rent", "lease"].includes(normalized)) return "rental";
  if (["shared", "common", "general"].includes(normalized)) return "common";
  return "unclassified";
}

function displayKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("es-ES"));
}

function getFactStatus(
  value: unknown,
  hasValue: boolean,
  group: QualificationGroup,
  key: string,
  malformed = false,
): QualificationFact["status"] {
  if (malformed) return "malformed";
  if (!hasValue || value === null) return "null";
  if (typeof value === "string" && value.length === 0) return "empty";
  if (group === "unclassified" || !KNOWN_FACTS.has(key)) return "unrecognized";
  return "recognized";
}

function makeFact(
  contact: RawContact,
  path: string,
  key: string,
  group: QualificationGroup,
  entry: unknown,
  malformed = false,
  topLevelProvenance?: { source: unknown; updatedAt: unknown },
): QualificationFact {
  const entryRecord = isRecord(entry) ? entry : null;
  const hasWrappedValue = entryRecord !== null && "value" in entryRecord;
  const hasValue = hasWrappedValue || entry !== undefined;
  const value = hasWrappedValue ? entryRecord.value : entry;
  const sourceValue = topLevelProvenance?.source ?? entryRecord?.source;
  const timestampValue = topLevelProvenance?.updatedAt ?? entryRecord?.updatedAt;
  const source = getString(sourceValue);
  const sourceRef = getString(entryRecord?.sourceRef);
  const confidence = getString(entryRecord?.confidence);
  const humanEdited = source?.toLowerCase() === "manual";

  return {
    id: path,
    group,
    key,
    label: displayKey(key),
    originalFieldName: path,
    originalValue: value,
    hasValue,
    source,
    sourceRef,
    sourceChannel: getString(contact.lead_source),
    sourceTimestamp: parseContactDate(timestampValue),
    confidence,
    status: getFactStatus(value, hasValue, group, key, malformed),
    humanEdited,
    conflict: false,
  };
}

function parseQualification(value: unknown): { value: unknown; malformed: boolean } {
  if (typeof value !== "string") return { value, malformed: false };
  try {
    const parsed: unknown = JSON.parse(value);
    return { value: parsed, malformed: false };
  } catch {
    return { value, malformed: true };
  }
}

function collectQualificationFacts(contact: RawContact): QualificationFact[] {
  const rawQualification = parseQualification(contact.qualification_data);
  if (rawQualification.malformed) {
    return [
      makeFact(
        contact,
        "qualification_data",
        "qualification_data",
        "unclassified",
        rawQualification.value,
        true,
      ),
    ];
  }

  const facts: QualificationFact[] = [];
  const root = isRecord(rawQualification.value) ? rawQualification.value : null;
  if (root) {
    for (const [key, value] of Object.entries(root)) {
      if (key === "qualification" || METADATA_KEYS.has(key)) continue;
      const provenance =
        key === "net_income"
          ? { source: root.income_source, updatedAt: root.income_updated_at }
          : undefined;
      facts.push(
        makeFact(contact, `qualification_data.${key}`, key, "unclassified", value, false, provenance),
      );
    }

    if (root.qualification !== undefined) {
      const qualification = isRecord(root.qualification) ? root.qualification : null;
      if (qualification) {
        for (const [groupName, groupValue] of Object.entries(qualification)) {
          if (groupName === "_meta" || METADATA_KEYS.has(groupName)) continue;
          const group = normalizeGroup(groupName);
          if (isRecord(groupValue)) {
            for (const [key, entry] of Object.entries(groupValue)) {
              if (METADATA_KEYS.has(key)) continue;
              facts.push(
                makeFact(
                  contact,
                  `qualification.${groupName}.${key}`,
                  key,
                  group,
                  entry,
                ),
              );
            }
          } else {
            facts.push(makeFact(contact, `qualification.${groupName}`, groupName, "unclassified", groupValue));
          }
        }
      } else {
        facts.push(
          makeFact(contact, "qualification", "qualification", "unclassified", root.qualification),
        );
      }
    }
  } else if (rawQualification.value !== null && rawQualification.value !== undefined) {
    facts.push(
      makeFact(
        contact,
        "qualification_data",
        "qualification_data",
        "unclassified",
        rawQualification.value,
      ),
    );
  }

  if (isRecord(contact.interest_preferences)) {
    const operationValue = getString(contact.interest_preferences.operation);
    const group = operationValue ? normalizeGroup(operationValue) : "unclassified";
    for (const [key, value] of Object.entries(contact.interest_preferences)) {
      facts.push(
        makeFact(
          contact,
          `interest_preferences.${key}`,
          key,
          key === "operation" ? normalizeGroup(operationValue ?? "") : group,
          value,
        ),
      );
    }
  } else if (contact.interest_preferences !== null && contact.interest_preferences !== undefined) {
    facts.push(
      makeFact(
        contact,
        "interest_preferences",
        "interest_preferences",
        "unclassified",
        contact.interest_preferences,
      ),
    );
  }

  return applyCurrentValuesAndConflicts(facts);
}

function stableValue(value: unknown): string {
  if (!isRecord(value) && !Array.isArray(value)) return JSON.stringify(value) ?? String(value);
  if (Array.isArray(value)) return `[${value.map(stableValue).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableValue(value[key])}`)
    .join(",")}}`;
}

function applyCurrentValuesAndConflicts(facts: QualificationFact[]): QualificationFact[] {
  const groups = new Map<string, QualificationFact[]>();
  for (const fact of facts) {
    const key = `${fact.group}:${fact.key}`;
    groups.set(key, [...(groups.get(key) ?? []), fact]);
  }

  const currentFacts: QualificationFact[] = [];
  for (const groupFacts of groups.values()) {
    const manualFacts = groupFacts.filter((fact) => fact.humanEdited);
    const visibleFacts = manualFacts.length > 0 ? manualFacts : groupFacts;
    const distinctValues = new Set(visibleFacts.map((fact) => stableValue(fact.originalValue)));
    for (const fact of visibleFacts) {
      currentFacts.push({ ...fact, conflict: distinctValues.size > 1 });
    }
  }

  return currentFacts;
}

function normalizeInteraction(value: unknown): NormalizedInteraction {
  const interaction = isRecord(value) ? value : null;
  const metadata = interaction?.metadata ?? null;
  const metadataRecord = isRecord(metadata) ? metadata : null;
  const rawContent = interaction?.content;
  const content =
    typeof rawContent === "string"
      ? rawContent
      : rawContent === undefined
        ? null
        : JSON.stringify(rawContent) ?? String(rawContent);

  return {
    id: getString(interaction?.id) ?? null,
    channel: normalizeSource(interaction?.channel, "interaction"),
    direction: getString(interaction?.direction),
    createdAt: parseContactDate(interaction?.created_at),
    content,
    transcript: getString(metadataRecord?.transcript_excerpt),
    metadata,
  };
}

function getInteractions(contact: RawContact): NormalizedInteraction[] {
  if (!Array.isArray(contact.interactions)) return [];
  return contact.interactions
    .map((interaction) => normalizeInteraction(interaction))
    .sort((left, right) => compareContactDatesDescending(left.createdAt, right.createdAt));
}

function normalizeBasics(contact: RawContact, exportOrganizationId: string | null): ContactListItem {
  const originalName = getString(contact.full_name);
  const phone = normalizeMethod(contact.phone, "phone");
  const email = normalizeMethod(contact.email, "email");
  const displayName = originalName
    ? titleCaseName(originalName)
    : phone.displayValue ?? email.displayValue ?? "Unnamed contact";
  const initials = getInitials(originalName ? displayName : phone.displayValue ?? email.displayValue);
  const organizationId = getString(contact.organization_id);
  const interactions = getInteractions(contact);
  const latest = interactions.find((interaction) => interaction.createdAt.dateKey !== null) ?? null;
  const summary = latest?.content?.trim() ?? null;

  return {
    id: contact.id,
    displayName,
    initials,
    source: normalizeSource(contact.lead_source),
    phone,
    email,
    createdAt: parseContactDate(contact.created_at),
    latestInteraction: latest
      ? {
          channel: latest.channel,
          createdAt: latest.createdAt,
          summary: summary ? `${summary.slice(0, 137)}${summary.length > 140 ? "…" : ""}` : null,
        }
      : null,
    isTest: contact.is_test === true,
    organizationId,
    exportOrganizationId,
    organizationMismatch:
      organizationId !== null &&
      exportOrganizationId !== null &&
      organizationId !== exportOrganizationId,
  };
}

function hasIntentEvidence(
  contact: RawContact,
  facts: QualificationFact[],
  interactions: NormalizedInteraction[],
): boolean {
  if (facts.some((fact) => fact.hasValue && fact.status !== "null" && fact.status !== "empty")) {
    return true;
  }

  const notes = getString(contact.notes);
  if (notes && /presupuesto|compra|alquiler|busca|inter[eé]s|campa[nñ]a|vivienda actual/i.test(notes)) {
    return true;
  }

  return interactions.some(
    (interaction) =>
      interaction.direction?.toLowerCase() === "inbound" &&
      interaction.content !== null &&
      /busco|busca|me interesa|estoy interesado|estoy interesada|quisiera|querr[ií]a|ten[eé]is pisos|sigue disponible|vivienda|alquiler|comprar/i.test(
        interaction.content,
      ),
  );
}

export function normalizeContactListItem(
  contact: RawContact,
  exportOrganizationId: string | null,
): ContactListItem {
  return normalizeBasics(contact, exportOrganizationId);
}

export function normalizeContactDetail(
  contact: RawContact,
  exportOrganizationId: string | null,
): ContactDetail {
  const basics = normalizeBasics(contact, exportOrganizationId);
  const qualificationFacts = collectQualificationFacts(contact);
  const interactions = getInteractions(contact);
  const restrictions = deriveContactRestrictions(contact, basics.phone.usable);
  const handoffRequested = contact.ai_handoff === true;
  const hasRecentInboundInteraction = interactions.some(
    (interaction) => interaction.direction?.toLowerCase() === "inbound",
  );
  const dataHealth: DataHealth = {
    contactMethodAvailable: basics.phone.usable || basics.email.usable,
    phoneAvailable: basics.phone.usable,
    emailAvailable: basics.email.usable,
    missingContactMethod: !basics.phone.usable && !basics.email.usable,
    intentAvailable: hasIntentEvidence(contact, qualificationFacts, interactions),
    missingIntent: !hasIntentEvidence(contact, qualificationFacts, interactions),
  };

  return {
    ...basics,
    notes: getString(contact.notes),
    handoff: {
      requested: handoffRequested,
      reason: getString(contact.handoff_reason),
      requestedAt: parseContactDate(contact.handoff_requested_at),
    },
    restrictions,
    dataHealth,
    recommendation: buildRecommendation(
      restrictions,
      handoffRequested,
      hasRecentInboundInteraction,
    ),
    qualificationFacts,
    interactions,
  };
}

export function formatQualificationValue(value: unknown, hasValue: boolean): string {
  if (!hasValue) return "Value not provided";
  if (value === null) return "Null value";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value.length > 0 ? value : "Empty string";
  if (typeof value === "number") return new Intl.NumberFormat("es-ES").format(value);
  return JSON.stringify(value, null, 2) ?? String(value);
}

export function formatSourceTimestamp(value: QualificationFact["sourceTimestamp"]): string | null {
  return formatContactDate(value);
}