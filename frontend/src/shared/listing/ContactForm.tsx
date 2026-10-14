import { useState } from "react";
import { Button } from "../components/Button";
import { Form } from "../components/forms/Form";
import { FormField } from "../components/forms/FormField";
import { TextInput } from "../components/forms/TextInput";
import { TextareaInput } from "../components/forms/TextareaInput";
import { BotCheck } from "../bot-check/BotCheck";

type Props = {
  actionLabel: string;
  className?: string;
  email?: string;
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

export function ContactForm({ actionLabel, className, email }: Props) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);

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

  if (email) {
    return (
      <p
        className={`font-mono text-[15px] leading-[1.2] text-text-dark${
          className ? ` ${className}` : ""
        }`}
      >
        {email}
      </p>
    );
  }

  if (sent) {
    return (
      <p
        className={`text-[15px] leading-normal text-body${
          className ? ` ${className}` : ""
        }`}
      >
        Message sent.
      </p>
    );
  }

  return (
    <div
      className={`rounded border-[1.5px] border-text-dark p-4 ${
        className ? ` ${className}` : ""
      }`}
    >
      <p className="mb-4 text-[15px] leading-normal text-body">
        Message the poster
      </p>
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
        <fieldset
          disabled={ready}
          className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0"
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
        </fieldset>
        {!ready ? (
          <Button type="submit" variant="yellow">
            Send
          </Button>
        ) : null}
      </Form>
        {ready ? (
            <BotCheck onSubmit={() => setSent(true)} pending={false} error="" />
          ) : null}
    </div>
  );
}