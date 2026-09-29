import type { ParsedContactDate } from "./contact-types";

export const DISPLAY_TIME_ZONE = "Europe/Madrid";

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTime(hour: number, minute: number, second = 0): boolean {
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59;
}

function madridLocalToTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
): number {
  const wallTime = Date.UTC(year, month - 1, day, hour, minute, second);
  let timestamp = wallTime;
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = formatter.formatToParts(new Date(timestamp));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const representedWallTime = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    );
    timestamp = wallTime - (representedWallTime - timestamp);
  }

  return timestamp;
}

function dateOnly(value: unknown, year: number, month: number, day: number): ParsedContactDate {
  if (!isValidCalendarDate(year, month, day)) {
    return { originalValue: value, kind: "invalid", timestamp: null, dateKey: null };
  }

  return {
    originalValue: value,
    kind: "date-only",
    timestamp: null,
    dateKey: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

function instant(value: unknown, timestamp: number): ParsedContactDate {
  if (!Number.isFinite(timestamp) || !Number.isFinite(new Date(timestamp).getTime())) {
    return { originalValue: value, kind: "invalid", timestamp: null, dateKey: null };
  }

  return {
    originalValue: value,
    kind: "instant",
    timestamp,
    dateKey: getMadridDateKey(timestamp),
  };
}

export function parseContactDate(value: unknown): ParsedContactDate {
  if (value === null || value === undefined || value === "") {
    return { originalValue: value, kind: "missing", timestamp: null, dateKey: null };
  }

  if (typeof value === "number") {
    return instant(value, value * 1000);
  }

  if (typeof value !== "string") {
    return { originalValue: value, kind: "invalid", timestamp: null, dateKey: null };
  }

  const normalized = value.trim();
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (isoDate) {
    return dateOnly(value, Number(isoDate[1]), Number(isoDate[2]), Number(isoDate[3]));
  }

  const spanishDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(
    normalized,
  );
  if (spanishDate) {
    const day = Number(spanishDate[1]);
    const month = Number(spanishDate[2]);
    const year = Number(spanishDate[3]);
    if (!spanishDate[4]) return dateOnly(value, year, month, day);

    const hour = Number(spanishDate[4]);
    const minute = Number(spanishDate[5]);
    const second = Number(spanishDate[6] ?? 0);
    if (!isValidCalendarDate(year, month, day) || !isValidTime(hour, minute, second)) {
      return { originalValue: value, kind: "invalid", timestamp: null, dateKey: null };
    }

    return instant(value, madridLocalToTimestamp(year, month, day, hour, minute, second));
  }

  const localIso = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    normalized,
  );
  if (localIso) {
    const [, yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue] = localIso;
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const hour = Number(hourValue);
    const minute = Number(minuteValue);
    const second = Number(secondValue ?? 0);
    if (!isValidCalendarDate(year, month, day) || !isValidTime(hour, minute, second)) {
      return { originalValue: value, kind: "invalid", timestamp: null, dateKey: null };
    }

    return instant(value, madridLocalToTimestamp(year, month, day, hour, minute, second));
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(normalized)) {
    const timestamp = Date.parse(normalized);
    if (Number.isFinite(timestamp)) return instant(value, timestamp);
  }

  return { originalValue: value, kind: "invalid", timestamp: null, dateKey: null };
}

export function getMadridDateKey(timestamp: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatContactDate(value: ParsedContactDate): string | null {
  if (value.kind === "date-only" && value.dateKey) {
    const [year, month, day] = value.dateKey.split("-").map(Number);
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "UTC",
      dateStyle: "medium",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  if (value.kind === "instant" && value.timestamp !== null) {
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: DISPLAY_TIME_ZONE,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value.timestamp));
  }

  return null;
}

export function formatContactTime(value: ParsedContactDate): string | null {
  if (value.kind !== "instant" || value.timestamp === null) return null;
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: DISPLAY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value.timestamp));
}

export function compareContactDatesDescending(
  left: ParsedContactDate,
  right: ParsedContactDate,
): number {
  const leftKnown = left.dateKey !== null;
  const rightKnown = right.dateKey !== null;
  if (leftKnown !== rightKnown) return leftKnown ? -1 : 1;
  if (!leftKnown || !rightKnown) return 0;

  const dateOrder = (right.dateKey ?? "").localeCompare(left.dateKey ?? "");
  if (dateOrder !== 0) return dateOrder;

  if (left.kind === "instant" && right.kind === "instant") {
    return (right.timestamp ?? 0) - (left.timestamp ?? 0);
  }
  if (left.kind === "instant") return -1;
  if (right.kind === "instant") return 1;
  return 0;
}