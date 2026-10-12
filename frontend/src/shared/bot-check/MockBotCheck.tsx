import { useState } from "react";
import { FormField } from "../components/forms/FormField.tsx";
import { Form } from "../components/forms/Form.tsx";
import { TextInput } from "../components/forms/TextInput.tsx";
import { Button } from "../components/Button.tsx";

type Props = {
  fields: Record<string, unknown>;
  onSuccess: () => void;
};
export function MockBotCheck({ fields, onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function check() {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      setError("VITE_API_URL is not set.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/mock-bot-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, password }),
      });
      if (res.ok) {
        onSuccess();
        return;
      }
      if (res.status === 401) {
        setError("That password is wrong.");
        return;
      }
      if (res.status === 503) {
        setError("Mock bot check is not configured.");
        return;
      }
      setError("Could not check the password.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Form className="pt-6 flex flex-col gap-4" onSubmit={() => { void check(); }}>
      <FormField label="Password:" error={error}>
        <TextInput
          type="password"
          name="mock-bot-check"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          invalid={Boolean(error)}
        />
      </FormField>
      <Button type="submit" variant="yellow" disabled={pending}>
        {pending ? "Checking…" : "Continue"}
      </Button>
    </Form>
  );
}