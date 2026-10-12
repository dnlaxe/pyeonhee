import { MockBotCheck } from "./MockBotCheck.tsx";

type Props = {
  fields: Record<string, unknown>;
  onSuccess: () => void;
};
export function BotCheck({ fields, onSuccess }: Props) {
  const mode = import.meta.env.VITE_BOT_CHECK || "password";
  if (mode === "password") {
    return <MockBotCheck fields={fields} onSuccess={onSuccess} />;
  }

  return (
    <p className="text-[15px] leading-normal text-body">
      This bot check is not set up yet.
    </p>
  );
}