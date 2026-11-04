import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, ErrorMessage } from "../../shared";
import { AppError, throwIfNotOk } from "../../lib/httpError";
import { PaymentStep } from "./PaymentStep";
import type { Order } from "./types";

const API = import.meta.env.VITE_API_URL;

type PayKind = "job" | "market" | "service";

function unexpectedKind(kind: never): never {
  throw new Error(`unexpected pay kind: ${String(kind)}`);
}

type PayDraft = {
  kind: PayKind;
  title: string;
  id: string;
  cancelTo: string;
};

const draftSources = [
  { key: "serviceDraft", kind: "service", idField: "serviceId", titleField: "company", cancelTo: "/post/service" },
  { key: "marketDraft", kind: "market", idField: "marketId", titleField: "title", cancelTo: "/post/market" },
  { key: "jobDraft", kind: "job", idField: "jobId", titleField: "title", cancelTo: "/post/job" },
] as const;

function readDraft(): PayDraft | null {
  const target = sessionStorage.getItem("payTarget");
  const source = draftSources.find((source) => source.kind === target);
  if (!source) return null;

  const raw = sessionStorage.getItem(source.key);
  if (!raw) return null;

  let stashedFormData: Record<string, string | undefined>;
  try {
    stashedFormData = JSON.parse(raw) as Record<string, string | undefined>;
  } catch {
    return null;
  }

  const id = stashedFormData[source.idField];
  const title = stashedFormData[source.titleField];
  if (!id) return null;

  return {
    kind: source.kind,
    title: title ?? "",
    id,
    cancelTo: source.cancelTo,
  };
}

function payUrl(path: string, kind: PayKind, id: string) {
  let key: string;
  switch (kind) {
    case "job":
      key = "jobId";
      break;
    case "market":
      key = "marketId";
      break;
    case "service":
      key = "serviceId";
      break;
    default:
      return unexpectedKind(kind);
  }
  return `${window.location.origin}${path}?${key}=${encodeURIComponent(id)}`;
}

async function checkout(draft: PayDraft): Promise<Order> {
  let body: { jobId: string } | { marketId: string } | { serviceId: string };
  switch (draft.kind) {
    case "job":
      body = { jobId: draft.id };
      break;
    case "market":
      body = { marketId: draft.id };
      break;
    case "service":
      body = { serviceId: draft.id };
      break;
    default:
      return unexpectedKind(draft.kind);
  }

  const res = await fetch(`${API}/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  throwIfNotOk(res);
  return (await res.json()) as Order;
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

export function PayPage() {
  const [draft] = useState(readDraft);
  const start = useMutation({ mutationFn: checkout });

  if (!draft) {
    return (
      <PayLayout title="Payment">
        <p className="text-[15px] leading-normal text-body">Start from the job, market, or service form.</p>
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
      <p className="text-[15px] leading-normal text-body">Pay for {draft.title}.</p>
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
  const serviceId = params.get("serviceId") ?? "";
  const orderId = params.get("orderId") ?? "";
  const paymentKey = params.get("paymentKey") ?? "";
  const amount = Number(params.get("amount"));

  const kind: PayKind | null = jobId
    ? "job"
    : marketId
      ? "market"
      : serviceId
        ? "service"
        : null;
  const id = jobId || marketId || serviceId;
  const complete = Boolean(kind && id && orderId && paymentKey && amount);
  const confirm = useQuery({
    queryKey: ["payment-confirm", kind, orderId, paymentKey],
    enabled: complete,
    retry: false,
    queryFn: async () => {
      if (kind === null) throw new Error("missing payment kind");
      let body: { orderId: string; paymentKey: string; amount: number; jobId?: string; marketId?: string; serviceId?: string };
      let draftKey: string;
      switch (kind) {
        case "job":
          body = { jobId: id, orderId, paymentKey, amount };
          draftKey = "jobDraft";
          break;
        case "market":
          body = { marketId: id, orderId, paymentKey, amount };
          draftKey = "marketDraft";
          break;
        case "service":
          body = { serviceId: id, orderId, paymentKey, amount };
          draftKey = "serviceDraft";
          break;
        default:
          return unexpectedKind(kind);
      }
      const res = await fetch(`${API}/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 402) {
        throw new AppError(
          "Your payment was declined. Please try again.",
          "warning",
        );
      }
      throwIfNotOk(res);
      sessionStorage.removeItem(draftKey);
      if (sessionStorage.getItem("payTarget") === kind) {
        sessionStorage.removeItem("payTarget");
      }
      return true;
    },
  });

  if (!kind || !id || !orderId || !paymentKey || !amount) {
    return (
      <PayLayout title="Payment">
        <p className="text-[15px] leading-normal text-body">Missing payment details.</p>
      </PayLayout>
    );
  }

  if (confirm.isPending) {
    return (
      <PayLayout title="Payment">
        <p className="text-[15px] leading-normal text-body">Confirming payment…</p>
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

  let viewTo: string;
  let liveLabel: string;
  switch (kind) {
    case "job":
      viewTo = `/jobs/${id}`;
      liveLabel = "job";
      break;
    case "market":
      viewTo = `/market/${id}`;
      liveLabel = "item";
      break;
    case "service":
      viewTo = "/services";
      liveLabel = "service";
      break;
    default:
      return unexpectedKind(kind);
  }
  return (
    <PayLayout title="Thank you">
      <p className="text-[15px] leading-normal text-body">
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
      <p className="text-[15px] leading-normal text-body">
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