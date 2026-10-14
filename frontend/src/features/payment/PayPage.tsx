import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, ErrorMessage } from "../../shared";
import { AppError, throwIfNotOk } from "../../lib/httpError";
import { PaymentStep } from "./PaymentStep";
import type { Order } from "./types";

const API = import.meta.env.VITE_API_URL;

type JobDraft = {
  title: string;
  jobId?: string;
};

function readDraft(): JobDraft | null {
  const raw = sessionStorage.getItem("jobDraft");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as JobDraft;
  } catch {
    return null;
  }
}

function payUrl(path: string, jobId: string) {
  return `${window.location.origin}${path}?jobId=${encodeURIComponent(jobId)}`;
}

async function checkout(jobId: string): Promise<Order> {
  const res = await fetch(`${API}/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId }),
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
  const jobId = draft?.jobId;

  if (!jobId) {
    return (
      <PayLayout title="Payment">
        <p className={textClass}>Start from the job form.</p>
      </PayLayout>
    );
  }

  if (start.data) {
    return (
      <PayLayout title="Payment">
        <PaymentStep
          order={start.data}
          successUrl={payUrl("/pay/success", jobId)}
          failUrl={payUrl("/pay/fail", jobId)}
        />
      </PayLayout>
    );
  }

  return (
    <PayLayout title="Payment">
      <p className={textClass}>Pay for {draft?.title}.</p>
      {start.error && <ErrorMessage error={start.error} />}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="yellow"
          disabled={start.isPending}
          onClick={() => start.mutate(jobId)}
        >
          {start.isPending ? "Starting…" : "Continue to payment"}
        </Button>
        <Button variant="outline" to="/post/job">
          Cancel
        </Button>
      </div>
    </PayLayout>
  );
}

export function PaySuccessPage() {
  const [params] = useSearchParams();
  const jobId = params.get("jobId") ?? "";
  const orderId = params.get("orderId") ?? "";
  const paymentKey = params.get("paymentKey") ?? "";
  const amount = Number(params.get("amount"));
  const complete = Boolean(jobId && orderId && paymentKey && amount);

  const confirm = useQuery({
    queryKey: ["payment-confirm", orderId, paymentKey],
    enabled: complete,
    retry: false,
    queryFn: async () => {
      const res = await fetch(`${API}/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, orderId, paymentKey, amount }),
      });
      if (res.status === 402) {
        throw new AppError("Your payment was declined. Please try again.", "warning");
      }
      throwIfNotOk(res);
      sessionStorage.removeItem("jobDraft");
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

  return (
    <PayLayout title="Thank you">
      <p className={textClass}>Payment received. Your job is now live.</p>
      <div>
        <Button variant="yellow" to={`/jobs/${jobId}`}>
          View your job
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