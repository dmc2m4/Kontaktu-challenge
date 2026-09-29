import { formatContactTime } from "@/lib/contacts/date-time";
import type { NormalizedInteraction } from "@/lib/contacts/contact-types";

export default function InteractionItem({ interaction }: { interaction: NormalizedInteraction }) {
  const time = formatContactTime(interaction.createdAt);
  const isVoice = interaction.channel.label === "Phone call";
  return (
    <li className="border-t border-border-subtle py-space-md">
      <div className="flex gap-space-sm">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-primary">{isVoice ? "☎" : interaction.channel.label === "WhatsApp" ? "◌" : "▤"}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-space-sm"><h4 className="text-body-sm font-semibold">{interaction.channel.label}</h4>{interaction.direction && <span className="text-label-sm text-on-surface-variant">{interaction.direction === "inbound" ? "Entrante" : "Saliente"}</span>}<span className="text-label-sm text-on-surface-variant">{time ?? "Hora no disponible"}</span></div>
          <p className="mt-space-xs whitespace-pre-wrap break-words text-body-sm text-on-surface-variant">{interaction.content ?? "Contenido no disponible"}</p>
          {isVoice && interaction.transcript && <details className="mt-space-sm rounded-md border border-border-subtle bg-surface-subtle px-space-md py-space-sm"><summary className="cursor-pointer text-label-md focus-visible:outline-2 focus-visible:outline-primary">Ver transcripción</summary><p className="mt-space-sm whitespace-pre-wrap break-words border-t border-border-subtle pt-space-sm text-body-sm text-on-surface-variant">{interaction.transcript}</p></details>}
        </div>
      </div>
    </li>
  );
}
