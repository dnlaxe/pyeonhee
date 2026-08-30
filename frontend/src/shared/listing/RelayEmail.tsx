import { useState } from "react";
import { Button } from "../components/Button";
import { FaqHelpLink } from "../links/FaqHelpLink";

function relayLocalPart(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return `ph${hash.toString(36)}r${(hash ^ 0x9e3779b9).toString(36)}`;
}

function maskLocal(local: string): string {
  if (local.length <= 2) return "•".repeat(local.length);
  return `${local[0]}${"•".repeat(Math.max(local.length - 2, 4))}${local[local.length - 1]}`;
}

type Props = {
  listingId: string;
  actionLabel: string;
  className?: string;
};

export function RelayEmail({ listingId, actionLabel, className }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const local = relayLocalPart(listingId);
  const email = `${local}@pyeonhee.com`;
  const masked = `${maskLocal(local)}@pyeonhee.com`;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  if (!open) {
    return (
      <Button
        variant="yellow"
        className={className}
        onClick={() => setOpen(true)}
      >
        {actionLabel}
      </Button>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
      <span className="font-mono text-[15px] leading-[1.2] text-muted">
        contact:
      </span>
      <span
        className="select-none font-mono text-[15px] leading-[1.2] text-text-dark"
        title="Relay address"
      >
        {masked}
      </span>
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center rounded border-[1.5px] border-text-dark bg-yellow px-4 py-2 font-mono text-sm leading-[1.2] text-text-dark hover:bg-yellow-accent"
          onClick={copyAddress}
        >
          {copied ? "copied" : "copy"}
        </button>
        <FaqHelpLink />
      </span>
    </div>
  );
}
