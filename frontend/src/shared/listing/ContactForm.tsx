import { useState } from "react";
import { Button } from "../components/Button";
import { Form } from "../components/forms/Form";
import { FormField } from "../components/forms/FormField";
import { TextInput } from "../components/forms/TextInput";
import { TextareaInput } from "../components/forms/TextareaInput";

type Props = {
  actionLabel: string;
  className?: string;
};

type ContactErrors = {
  email?: string;
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(data: FormData): ContactErrors {
  const errors: ContactErrors = {};
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (email === "") {
    errors.email = "Enter an email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a full email address, like name@example.com.";
  }

  if (message === "") {
    errors.message = "Enter a message.";
  }

  return errors;
}

export function ContactForm({ actionLabel, className }: Props) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);

  if (!open) {
    return (
      <Button
        variant="yellow"
        className={className}
        onClick={() => setOpen(true)}
      >
        {actionLabel}
      </Button>
    );
  }

  return (
    <div
      className={`rounded border-[1.5px] border-text-dark p-4${
        className ? ` ${className}` : ""
      }`}
    >
      <p className="mb-4 text-[15px] leading-normal text-body">
        Message the poster
      </p>
      {ready ? (
        <div className="rounded border-[1.5px] border-dashed border-text-dark p-4">
          <p className="font-mono text-sm leading-[1.4] text-text-dark">
            Bot check goes here
          </p>
          <p className="mt-2 text-[15px] leading-normal text-body">
            Nothing was sent. The bot check is not connected yet.
          </p>
        </div>
      ) : (
        <Form
          noValidate
          onSubmit={(e) => {
            const data = new FormData(e.currentTarget);
            const next = validateContact(data);
            setSubmitted(true);
            setErrors(next);
            if (Object.keys(next).length > 0) return;
            setReady(true);
          }}
          onChange={(e) => {
            if (!submitted) return;
            setErrors(validateContact(new FormData(e.currentTarget)));
          }}
        >
          <FormField label="Your email:" error={errors.email}>
            <TextInput
              type="email"
              name="email"
              required
              invalid={Boolean(errors.email)}
            />
          </FormField>
          <FormField label="Message:" error={errors.message}>
            <TextareaInput
              name="message"
              rows={5}
              required
              invalid={Boolean(errors.message)}
            />
          </FormField>
          <Button type="submit" variant="yellow">
            Send
          </Button>
        </Form>
      )}
    </div>
  );
}
