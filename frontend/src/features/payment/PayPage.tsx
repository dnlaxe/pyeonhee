import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, ErrorMessage } from "../../shared";
import { AppError, throwIfNotOk } from "../../lib/httpError";
import { PaymentStep } from "./PaymentStep";
import type { Order } from "./types";

const API = import.meta.env.VITE_API_URL;

type PayKind = "job" | "market";

type PayDraft = {
  kind: PayKind;
  title: string;
  id: string;
  cancelTo: string;
  successViewTo: (id: string) => string;
  liveLabel: string;
};

function readJobDraft(): PayDraft | null {
  const raw = sessionStorage.getItem("jobDraft");
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as { title?: string; jobId?: string };
    if (!d.jobId) return null;
    return {
      kind: "job",
      title: d.title ?? "",
      id: d.jobId,
      cancelTo: "/post/job",
      successViewTo: (id) => `/jobs/${id}`,
      liveLabel: "job",
    };
  } catch {
    return null;
  }
}

function readMarketDraft(): PayDraft | null {
  const raw = sessionStorage.getItem("marketDraft");
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as { title?: string; marketId?: string };
    if (!d.marketId) return null;
    return {
      kind: "market",
      title: d.title ?? "",
      id: d.marketId,
      cancelTo: "/post/market",
      successViewTo: (id) => `/market/${id}`,
      liveLabel: "item",
    };
  } catch {
    return null;
  }
}

function readDraft(): PayDraft | null {
  return readMarketDraft() ?? readJobDraft();
}

function payUrl(path: string, kind: PayKind, id: string) {
  const key = kind === "job" ? "jobId" : "marketId";
  return `${window.location.origin}${path}?${key}=${encodeURIComponent(id)}`;
}

const MOCK_MARKET_CHECKOUT = true;

async function checkout(draft: PayDraft): Promise<Order> {
  if (draft.kind === "market" && MOCK_MARKET_CHECKOUT) {
    return {
      orderId: crypto.randomUUID(),
      amount: 5000,
      orderName: "pyeonhee market post",
    };
  }

  const res = await fetch(`${API}/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      draft.kind === "job" ? { jobId: draft.id } : { marketId: draft.id },
    ),
  });
  throwIfNotOk(res);
  return res.json() as Promise<Order>;
}


function PayLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main>
      <article className="py-2 pb-20">
        <div className="mx-auto flex w-[min(100%-48px,1120px)] max-w-essay flex-col gap-4 max-md:w-[min(100%-32px,1120px)]">
          <h1 className="text-[clamp(24px,4vw,32px)] font-bold leading-[1.2] tracking-[-0.5px] text-text">
            {title}
          </h1>
          {children}
        </div>
      </article>
    </main>
  );
}

const textClass = "text-[15px] leading-normal text-body";

export function PayPage() {
  const [draft] = useState(readDraft);
  const start = useMutation({ mutationFn: checkout });

  if (!draft) {
    return (
      <PayLayout title="Payment">
        <p className={textClass}>Start from the job or market form.</p>
      </PayLayout>
    );
  }

  if (start.data) {
    return (
      <PayLayout title="Payment">
        <PaymentStep
          order={start.data}
          successUrl={payUrl("/pay/success", draft.kind, draft.id)}
          failUrl={payUrl("/pay/fail", draft.kind, draft.id)}
        />
      </PayLayout>
    );
  }

  return (
    <PayLayout title="Payment">
      <p className={textClass}>Pay for {draft.title}.</p>
      {start.error && <ErrorMessage error={start.error} />}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="yellow"
          disabled={start.isPending}
          onClick={() => start.mutate(draft)}
        >
          {start.isPending ? "Starting…" : "Continue to payment"}
        </Button>
        <Button variant="outline" to={draft.cancelTo}>
          Cancel
        </Button>
      </div>
    </PayLayout>
  );
}

export function PaySuccessPage() {
  const [params] = useSearchParams();
  const jobId = params.get("jobId") ?? "";
  const marketId = params.get("marketId") ?? "";
  const orderId = params.get("orderId") ?? "";
  const paymentKey = params.get("paymentKey") ?? "";
  const amount = Number(params.get("amount"));

  const kind: PayKind | null = jobId ? "job" : marketId ? "market" : null;
  const id = jobId || marketId;
  const complete = Boolean(kind && id && orderId && paymentKey && amount);

  const confirm = useQuery({
    queryKey: ["payment-confirm", kind, orderId, paymentKey],
    enabled: complete,
    retry: false,
    queryFn: async () => {
      if (kind === "market" && MOCK_MARKET_CHECKOUT) {
        sessionStorage.removeItem("marketDraft");
        return true;
      }

      const res = await fetch(`${API}/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "job"
            ? { jobId: id, orderId, paymentKey, amount }
            : { marketId: id, orderId, paymentKey, amount },
        ),
      });
      if (res.status === 402) {
        throw new AppError(
          "Your payment was declined. Please try again.",
          "warning",
        );
      }
      throwIfNotOk(res);
      sessionStorage.removeItem(kind === "job" ? "jobDraft" : "marketDraft");
      return true;
    },
  });

  if (!complete) {
    return (
      <PayLayout title="Payment">
        <p className={textClass}>Missing payment details.</p>
      </PayLayout>
    );
  }

  if (confirm.isPending) {
    return (
      <PayLayout title="Payment">
        <p className={textClass}>Confirming payment…</p>
      </PayLayout>
    );
  }

  if (confirm.error) {
    return (
      <PayLayout title="Payment not completed">
        <ErrorMessage error={confirm.error} />
        <div>
          <Button variant="yellow" to="/pay">
            Try again
          </Button>
        </div>
      </PayLayout>
    );
  }

  const viewTo = kind === "job" ? `/jobs/${id}` : `/market/${id}`;
  const liveLabel = kind === "job" ? "job" : "item";

  return (
    <PayLayout title="Thank you">
      <p className={textClass}>
        Payment received. Your {liveLabel} is now live.
      </p>
      <div>
        <Button variant="yellow" to={viewTo}>
          View your {liveLabel}
        </Button>
      </div>
    </PayLayout>
  );
}

export function PayFailPage() {
  const [params] = useSearchParams();
  const cancelled = params.get("code") === "PAY_PROCESS_CANCELED";

  return (
    <PayLayout title="Payment not completed">
      <p className={textClass}>
        {cancelled ? "You cancelled the payment." : "The payment did not go through."}
      </p>
      <div>
        <Button variant="yellow" to="/pay">
          Try again
        </Button>
      </div>
    </PayLayout>
  );
}