export type Order = {
  orderId: string;
  amount: number;
  orderName: string;
};

export type PaymentStepProps = {
  order: Order;
  successUrl: string;
  failUrl: string;
};