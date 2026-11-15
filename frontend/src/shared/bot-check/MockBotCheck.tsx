import { useState } from "react";
import { FormField } from "../components/forms/FormField.tsx";
import { Form } from "../components/forms/Form.tsx";
import { TextInput } from "../components/forms/TextInput.tsx";
import { Button } from "../components/Button.tsx";

type Props = {
  onSubmit: (password: string) => void;
  pending: boolean;
  error: string;
};

export function MockBotCheck({ onSubmit, pending, error }: Props) {
  const [password, setPassword] = useState("");

  return (
    <Form
      className="mt-6 gap-4 border-t border-border pt-6"
      onSubmit={() => onSubmit(password)}
    >
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
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Checking…" : "Continue"}
      </Button>
    </Form>
  );
}