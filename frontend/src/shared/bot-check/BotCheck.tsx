import { MockBotCheck } from "./MockBotCheck.tsx";

type Props = {
  onSubmit: (token: string) => void;
  pending: boolean;
  error: string;
};

export function BotCheck(props: Props) {
  const mode = import.meta.env.VITE_BOT_CHECK || "password";
  if (mode === "password") {
    return <MockBotCheck {...props} />;
  }

  return (
    <p className="text-[15px] leading-normal text-body">
      This bot check is not set up yet.
    </p>
  );
}