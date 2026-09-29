export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type RawContact = Record<string, unknown> & { id: string };

export interface ContactDataset {
  organizationId: string | null;
  contacts: RawContact[];
}

export type QualificationGroup =
  | "purchase"
  | "rental"
  | "common"
  | "unclassified";

export interface ParsedContactDate {
  originalValue: unknown;
  kind: "instant" | "date-only" | "invalid" | "missing";
  timestamp: number | null;
  dateKey: string | null;
}

export interface NormalizedSource {
  originalValue: string | null;
  label: string;
  recognized: boolean;
}

export interface ContactMethod {
  originalValue: string | null;
  displayValue: string | null;
  usable: boolean;
  malformed: boolean;
}

export interface QualificationFact {
  id: string;
  group: QualificationGroup;
  key: string;
  label: string;
  originalFieldName: string;
  originalValue: unknown;
  hasValue: boolean;
  source: string | null;
  sourceRef: string | null;
  sourceChannel: string | null;
  sourceTimestamp: ParsedContactDate;
  confidence: string | null;
  status: "recognized" | "unrecognized" | "malformed" | "empty" | "null";
  humanEdited: boolean;
  conflict: boolean;
}

export interface NormalizedInteraction {
  id: string | null;
  channel: NormalizedSource;
  direction: string | null;
  createdAt: ParsedContactDate;
  content: string | null;
  transcript: string | null;
  metadata: unknown;
}

export interface ContactRestrictions {
  callConsent: "granted" | "denied" | "unknown";
  callAllowed: boolean;
  callReasons: string[];
  noCallPreference: boolean;
  whatsappOptOut: boolean;
  whatsappAvailable: boolean;
  whatsappReasons: string[];
  preferences: string[];
}

export interface DataHealth {
  contactMethodAvailable: boolean;
  phoneAvailable: boolean;
  emailAvailable: boolean;
  missingContactMethod: boolean;
  intentAvailable: boolean;
  missingIntent: boolean;
}

export interface ContactListItem {
  id: string;
  displayName: string;
  initials: string | null;
  source: NormalizedSource;
  phone: ContactMethod;
  email: ContactMethod;
  createdAt: ParsedContactDate;
  latestInteraction: {
    channel: NormalizedSource;
    direction: string | null;
    createdAt: ParsedContactDate;
    summary: string | null;
  } | null;
  isTest: boolean;
  organizationId: string | null;
  exportOrganizationId: string | null;
  organizationMismatch: boolean;
}

export interface ContactDetail extends ContactListItem {
  notes: string | null;
  handoff: {
    requested: boolean;
    reason: string | null;
    requestedAt: ParsedContactDate;
  };
  restrictions: ContactRestrictions;
  dataHealth: DataHealth;
  recommendation: string | null;
  qualificationFacts: QualificationFact[];
  interactions: NormalizedInteraction[];
}