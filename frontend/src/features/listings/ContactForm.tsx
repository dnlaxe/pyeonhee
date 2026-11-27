import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError.ts";
import { formRules } from "../../config";
import {
  Button,
  Form,
  FormField,
  TextInput,
  TextareaInput,
  BotCheck,
  FaqLink,
} from "../../shared";

const boxClass = "card-bordered mt-4 p-5";

type Props = {
  actionLabel: string;
  extraClass?: string;
  email?: string;
  kind: "job" | "market";
  id: string;
};

type ContactErrors = {
  email?: string;
  message?: string;
};

function validateContact(data: FormData): ContactErrors {
  const errors: ContactErrors = {};
  const rules = formRules.contact;
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (email === "") {
    errors.email = "Enter an email address.";
  } else if (email.length > rules.email.maxLength) {
    errors.email = "Shorten the email address.";
  } else if (!rules.email.pattern.test(email)) {
    errors.email = "Enter a full email address, like name@example.com.";
  }

  if (message === "") {
    errors.message = "Enter a message.";
  } else if (message.length < rules.message.minLength) {
    errors.message = "Make the message a little longer.";
  } else if (message.length > rules.message.maxLength) {
    errors.message = "Shorten the message.";
  }

  return errors;
}

export function ContactForm({ actionLabel, extraClass, email, kind, id }: Props) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);

  const [fields, setFields] = useState<{ email: string; message: string } | null>(
    null,
  );
  const [botCheckError, setBotCheckError] = useState("");

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
        className={`text-email-reveal m-0${extraClass ? ` ${extraClass}` : ""}`}
      >
        {email}
      </p>
    );
  }

  return (
    <div className={extraClass}>
      {!open ? (
        <Button onClick={() => setOpen(true)}>{label}</Button>
      ) : null}

      {open && !revealEmail && sent ? (
        <div className={boxClass}>
          <p className="heading-card m-0 mb-2">Message sent!</p>
          <p className="text-body-sm m-0">
            We emailed the poster your message. If they reply, you&apos;ll get
            their response in your inbox — then you can write each other
            directly. Check spam if nothing shows up soon.
          </p>
        </div>
      ) : null}

      {open && !revealEmail && !sent ? (
        <div className={boxClass}>
          <p className="heading-card m-0 mb-2">Message the poster</p>
          <p className="text-body-sm m-0 mb-5">
            Your email is not given to the poster — they only receive your
            message. It is shared only if you later respond to their reply. See
            our <FaqLink>FAQs</FaqLink> for details.
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
              className="field-fieldset m-0 flex min-w-0 flex-col gap-5 p-0"
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
                  extraClass="field-textarea-sm"
                  invalid={Boolean(errors.message)}
                />
              </FormField>
            </fieldset>
            {!ready ? <Button type="submit">Send</Button> : null}
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