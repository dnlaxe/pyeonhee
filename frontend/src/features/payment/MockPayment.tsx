import type { PaymentStepProps } from "./types";

const btnClass =
  "inline-flex cursor-pointer items-center justify-center border-[1.5px] border-text bg-accent px-7 py-3 text-base leading-[1.2] text-text hover:bg-accent-hover";

function withParams(base: string, params: Record<string, string>) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function MockPayment({ order, successUrl, failUrl }: PaymentStepProps) {
  const amount = String(order.amount);

  function pay(keyPrefix: string) {
    window.location.assign(
      withParams(successUrl, {
        paymentKey: `${keyPrefix}${crypto.randomUUID()}`,
        orderId: order.orderId,
        amount,
      }),
    );
  }

  function cancel() {
    window.location.assign(
      withParams(failUrl, {
        code: "PAY_PROCESS_CANCELED",
        message: "Payment was cancelled.",
        orderId: order.orderId,
      }),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] leading-normal text-body">
        Mock payment: {order.amount} won for {order.orderName}.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={btnClass} onClick={() => pay("mock_")}>
          Pay
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => pay("declined_")}
        >
          Decline
        </button>
        <button type="button" className={btnClass} onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
