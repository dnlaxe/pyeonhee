import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import { Button } from "../components/Button";
import { Form } from "../components/forms/Form";
import { FormField } from "../components/forms/FormField";
import { TextInput } from "../components/forms/TextInput";
import { TextareaInput } from "../components/forms/TextareaInput";
import { BotCheck } from "../bot-check/BotCheck";
import { FaqLink } from "../links/FaqLink";

type Props = {
  actionLabel: string;
  className?: string;
  email?: string;
  kind: "job" | "market";
  id: string;
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

export function ContactForm({ actionLabel, className, email, kind, id }: Props) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);

  const [fields, setFields] = useState<{ email: string; message: string } | null>(
    null,
  );
  const [botCheckError, setBotCheckError] = useState("");

  // Poster chose “show email” — CTA reveals it instead of the relay form.
  const revealEmail = Boolean(email?.trim());
  const label = revealEmail ? "Contact" : actionLabel;

  const send = useMutation({
    mutationFn: async (password: string) => {
      if (!fields) throw new Error("missing fields");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          id,
          email: fields.email,
          message: fields.message,
          password,
        }),
      });
      if (res.status === 401) return { kind: "botCheckFailed" as const };
      throwIfNotOk(res);
      return { kind: "sent" as const };
    },
  });

  if (open && revealEmail) {
    return (
      <p
        className={`m-0 text-[15px] leading-[1.2] text-text${
          className ? ` ${className}` : ""
        }`}
      >
        {email}
      </p>
    );
  }

  return (
    <div className={className}>
      {!open ? (
        <Button variant="accent-lg" onClick={() => setOpen(true)}>
          {label}
        </Button>
      ) : null}

      {open && !revealEmail && sent ? (
        <div className="detail-contact-box">
          <p className="mb-2 m-0 text-[20px] font-normal leading-[1.2] tracking-normal text-text max-[399px]:text-[18px]">
            Message sent!
          </p>
          <p className="m-0 text-[14px] leading-normal text-body">
            We emailed the poster your message. If they reply, you&apos;ll get their
            response in your inbox — then you can write each other directly. Check
            spam if nothing shows up soon.
          </p>
        </div>
      ) : null}

      {open && !revealEmail && !sent ? (
        <div className="detail-contact-box">
          <p className="mb-2 m-0 text-[20px] font-normal leading-[1.2] tracking-normal text-text max-[399px]:text-[18px]">
            Message the poster
          </p>
          <p className="mb-5 m-0 text-[14px] leading-normal text-body">
            Your email is not given to the poster — they only receive your message.
            It is shared only if you later respond to their reply. See our{" "}
            <FaqLink>FAQs</FaqLink> for details.
          </p>
          <Form
            noValidate
            onSubmit={(e) => {
              const data = new FormData(e.currentTarget);
              const next = validateContact(data);
              setErrors(next);
              if (Object.keys(next).length > 0) return;
              setFields({
                email: String(data.get("email") ?? "").trim(),
                message: String(data.get("message") ?? "").trim(),
              });
              setBotCheckError("");
              setReady(true);
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
                  className="min-h-[120px]"
                  invalid={Boolean(errors.message)}
                />
              </FormField>
            </fieldset>
            {!ready ? (
              <Button type="submit" variant="accent-lg">
                Send
              </Button>
            ) : null}
          </Form>
          {ready ? (
            <BotCheck
              onSubmit={(password) => {
                setBotCheckError("");
                send.mutate(password, {
                  onSuccess: (result) => {
                    if (result.kind === "botCheckFailed") {
                      setBotCheckError("That password is wrong.");
                      return;
                    }
                    setSent(true);
                  },
                });
              }}
              pending={send.isPending}
              error={botCheckError || send.error?.message || ""}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
