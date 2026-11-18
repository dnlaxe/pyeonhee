import { useState } from "react";
import { FormField } from "../forms/FormField.tsx";
import { Form } from "../forms/Form.tsx";
import { TextInput } from "../forms/TextInput.tsx";
type Props = {
  onSubmit: (password: string) => void;
  pending: boolean;
  error: string;
};

export function MockBotCheck({ onSubmit, pending, error }: Props) {
  const [password, setPassword] = useState("");

  return (
    <Form
      extraClass="pt-6 flex flex-col gap-4"
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
      <button type="submit" className="primaryBtn" disabled={pending}>
        {pending ? "Checking…" : "Continue"}
      </button>
    </Form>
  );
}