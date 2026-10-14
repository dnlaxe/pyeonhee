import { MockPayment } from "./MockPayment";
import type { PaymentStepProps } from "./types";

export function PaymentStep(props: PaymentStepProps) {
  const mode = import.meta.env.VITE_PAYMENT || "mock";
  if (mode === "mock") {
    return <MockPayment {...props} />;
  }

  return (
    <p className="text-[15px] leading-normal text-body">
      This payment method is not set up yet.
    </p>
  );
}