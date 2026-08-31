import { useState } from "react";
import { Navigate, useParams } from "react-router";
import {
  Button,
  BackLink,
  Form,
  FormField,
  RadioGroup,
  SelectInput,
  TextInput,
  TextareaInput,
  FaqHelpLink,
  FaqLink,
} from "../../shared";
import {
  serviceFilters,
  teachingAreas,
  nonTeachingAreas,
  emailOptions,
  koreanLevels,
  employmentTypes,
  kinds,
} from "./constants";

function JobPostForm() {
  const [track, setTrack] = useState<"teaching" | "non-teaching" | "">("");
  const areas = track === "teaching" ? teachingAreas : nonTeachingAreas;

  const relayEmailOption = {
    value: "relay",
    label: (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        Use CL relay (recommended). Email will not be publicly visible
        <FaqHelpLink />
      </span>
    ),
  };

  return (
    <Form>
      <FormField label="Email address:">
        <TextInput type="email" name="email" required />
      </FormField>

      <RadioGroup
        legend="Email options:"
        name="emailOption"
        options={[relayEmailOption, ...emailOptions]}
        defaultValue="relay"
      />

      <FormField label="Post title:">
        <TextInput type="text" name="title" required />
      </FormField>

      <FormField label="Location:">
        <TextInput type="text" name="location" required />
      </FormField>

      <FormField label="Employment type:">
        <SelectInput name="employmentType" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {employmentTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Teaching / non-teaching:">
        <SelectInput
          name="track"
          required
          value={track}
          onChange={(e) =>
            setTrack(e.target.value as "teaching" | "non-teaching" | "")
          }
        >
          <option value="" disabled>
            Select…
          </option>
          <option value="teaching">Teaching</option>
          <option value="non-teaching">Non-teaching</option>
        </SelectInput>
      </FormField>

      <FormField label="Job area:">
        <SelectInput
          name="area"
          required
          disabled={!track}
          key={track || "none"}
          defaultValue=""
        >
          <option value="" disabled>
            {track ? "Select…" : "Select teaching / non-teaching first"}
          </option>
          {track &&
            areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
        </SelectInput>
      </FormField>

      <FormField label="Korean requirement:">
        <SelectInput name="korean" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {koreanLevels.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Post description:">
        <TextareaInput name="description" rows={8} required />
      </FormField>

      <Button type="submit" variant="yellow" className="mt-2">
        Send
      </Button>
    </Form>
  );
}

function MarketPostForm() {
  return (
    <Form>
      <FormField label="Name:">
        <TextInput type="text" name="name" required />
      </FormField>
      <FormField label="Contact:">
        <TextInput type="text" name="contact" required />
      </FormField>
      <FormField label="Title:">
        <TextInput type="text" name="title" required />
      </FormField>
      <FormField label="Message:">
        <TextareaInput name="message" rows={6} required />
      </FormField>
      <Button type="submit" variant="yellow" className="mt-2">
        Send
      </Button>
    </Form>
  );
}

function ServicePostForm() {
  return (
    <Form>
      <FormField label="Company name:">
        <TextInput type="text" name="company" required />
      </FormField>

      <FormField label="Location:">
        <TextInput type="text" name="location" required />
      </FormField>

      <FormField label="Service:">
        <SelectInput name="category" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {serviceFilters.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Message:">
        <TextareaInput name="message" rows={8} required />
      </FormField>

      <Button type="submit" variant="yellow" className="mt-2">
        Send
      </Button>
    </Form>
  );
}

export function PostFormPage() {
  const { kind } = useParams();
  const config =
    kind === "job" || kind === "market" || kind === "service"
      ? kinds[kind]
      : null;

  if (!config) {
    return <Navigate to="/post" replace />;
  }

  return (
    <main>
      <article className="py-2 pb-20">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <BackLink to="/post">← back to post</BackLink>
          <h1 className="mb-4 text-[clamp(24px,4vw,32px)] font-bold leading-[1.2] tracking-[-0.5px] text-text">
            {config.title}
          </h1>
          <p className="mb-8 text-[15px] leading-normal text-body">
            {config.privacy} See our <FaqLink>FAQs</FaqLink> for posting
            guidelines and safety tips.
          </p>
          {kind === "job" ? (
            <JobPostForm />
          ) : kind === "market" ? (
            <MarketPostForm />
          ) : (
            <ServicePostForm />
          )}
        </div>
      </article>
    </main>
  );
}
