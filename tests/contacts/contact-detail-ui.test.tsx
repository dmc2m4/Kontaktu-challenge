import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactActionStatus, InteractionTimeline } from "@/components/contact-detail/contact-detail-view";
import { normalizeContactDetail } from "@/lib/contacts/contact-normalization";
import { validateContactDataset } from "@/lib/contacts/contact-validation";

function makeDetail(fields: Record<string, unknown> = {}) {
  const dataset = validateContactDataset({
    organization: { id: "ORG-0031" },
    contacts: [{ id: "contact-1", ...fields }],
  });
  return normalizeContactDetail(dataset.contacts[0], dataset.organizationId);
}

describe("contact action status", () => {
  it("shows blocked call reasons without rendering external action links", () => {
    const detail = makeDetail({ phone: "+34 655 12 34 56" });
    render(<ContactActionStatus contact={detail} />);

    expect(screen.getByText("Bloqueadas")).toBeTruthy();
    expect(screen.getByText("Call consent is not recorded.")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("interaction transcript disclosure", () => {
  it("renders call transcripts in a native keyboard-operable disclosure", () => {
    const detail = makeDetail({
      interactions: [
        {
          id: "call-1",
          channel: "VOICE",
          direction: "inbound",
          created_at: "2026-07-08T10:28:00Z",
          content: "Call summary",
          metadata: { transcript_excerpt: "Transcript contents" },
        },
      ],
    });
    render(<InteractionTimeline contact={detail} />);

    const summary = screen.getByText("Ver transcripción");
    const disclosure = summary.closest("details");
    expect(disclosure).toBeTruthy();
    expect(disclosure?.open).toBe(false);
    fireEvent.click(summary);
    expect(disclosure?.open).toBe(true);
    expect(screen.getByText("Transcript contents")).toBeTruthy();
  });
});