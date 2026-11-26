import { Button } from "../../shared";
import type { PaymentStepProps } from "./types";

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
      <p className="text-intro m-0">
        Mock payment: {order.amount} won for {order.orderName}.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => pay("mock_")}>Pay</Button>
        <Button variant="secondary" onClick={() => pay("declined_")}>
          Decline
        </Button>
        <Button variant="secondary" onClick={cancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
