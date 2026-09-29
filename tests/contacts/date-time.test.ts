import { describe, expect, it } from "vitest";
import {
  compareContactDatesDescending,
  formatContactDate,
  formatContactTime,
  parseContactDate,
} from "@/lib/contacts/date-time";

describe("contact date parsing", () => {
  it("parses ISO timestamps and epoch seconds as instants", () => {
    expect(parseContactDate("2026-07-08T10:28:00Z").timestamp).toBe(
      Date.UTC(2026, 6, 8, 10, 28),
    );
    expect(parseContactDate(1782259200).timestamp).toBe(1782259200000);
  });

  it("preserves date-only values without inventing a time", () => {
    const parsed = parseContactDate("11/07/2026");
    expect(parsed.kind).toBe("date-only");
    expect(parsed.dateKey).toBe("2026-07-11");
    expect(parsed.timestamp).toBeNull();
    expect(formatContactTime(parsed)).toBeNull();
  });

  it("interprets timezone-less Spanish date-times in Europe/Madrid", () => {
    const summer = parseContactDate("11/07/2026 18:42");
    const winter = parseContactDate("05/01/2026 18:42");

    expect(summer.timestamp).toBe(Date.UTC(2026, 6, 11, 16, 42));
    expect(winter.timestamp).toBe(Date.UTC(2026, 0, 5, 17, 42));
    expect(formatContactTime(summer)).toBe("18:42");
  });

  it("handles local ISO date-times across normal daylight-saving offsets", () => {
    expect(parseContactDate("2026-03-29T01:30").timestamp).toBe(
      Date.UTC(2026, 2, 29, 0, 30),
    );
    expect(parseContactDate("2026-03-29T03:30").timestamp).toBe(
      Date.UTC(2026, 2, 29, 1, 30),
    );
  });

  it("keeps invalid and missing dates explicit", () => {
    expect(parseContactDate("31/02/2026").kind).toBe("invalid");
    expect(parseContactDate("not-a-date").kind).toBe("invalid");
    expect(parseContactDate(null).kind).toBe("missing");
  });

  it("sorts newest first and places date-only entries after timed items on that date", () => {
    const late = parseContactDate("2026-07-11T20:00:00Z");
    const early = parseContactDate("11/07/2026 18:42");
    const dateOnly = parseContactDate("11/07/2026");
    const previousDay = parseContactDate("2026-07-10T21:00:00Z");

    expect([late, dateOnly, previousDay, early].sort(compareContactDatesDescending)).toEqual([
      late,
      early,
      dateOnly,
      previousDay,
    ]);
  });

  it("formats an instant as a Spanish date in the display zone", () => {
    const formatted = formatContactDate(parseContactDate("2026-07-08T10:28:00Z"));
    expect(formatted).toContain("8");
    expect(formatted).toContain("2026");
  });
});