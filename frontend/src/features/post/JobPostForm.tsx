import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import {
  BotCheck,
  Button,
  Form,
  FormErrorSummary,
  FormField,
  PhotoUpload,
  RadioGroup,
  SelectInput,
  TextareaInput,
  TextInput,
  usePhotoFiles,
} from "../../shared";
import { formRules } from "../../config";
import { createListing, uploadPhoto, type JobFields } from "./api";
import { validateJob, type JobErrors } from "./validation";
import { PinField } from "./PinField";

type JobDraft = {
  email: string;
  emailOption: string;
  title: string;
  location: string;
  employmentType: string;
  track: "Teaching" | "Non-teaching" | "";
  area: string;
  korean: string;
  description: string;
  pinned: boolean;
  method: string;
};

function readJobDraft(): JobDraft | null {
  const raw = sessionStorage.getItem("jobDraft");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function JobPostForm() {
  const [draft] = useState(readJobDraft);
  const [track, setTrack] = useState<"Teaching" | "Non-teaching" | "">(
    draft?.track ?? "",
  );
  const [errors, setErrors] = useState<JobErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const areas = track === "" ? [] : formRules.jobs.track.options[track];
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  const photoRules = formRules.jobs.photos;
  const MAX_PHOTOS = photoRules.max;
  const { photos, addPhotos, removePhoto } = usePhotoFiles(photoRules);

  const [fields, setFields] = useState<JobDraft | null>(null);
  const [botCheckError, setBotCheckError] = useState("");

  const mutation = useMutation({
    mutationFn: async ({
      fields,
      password,
      file,
    }: {
      fields: JobFields;
      password: string;
      file?: File;
    }) => {
      let logo: string | undefined;
      if (file) {
        const uploaded = await uploadPhoto("/photos", file, password);
        if (uploaded.kind !== "uploaded") return uploaded;
        logo = uploaded.key;
      }
      return createListing<JobErrors>(
        "/jobs",
        {
          email: fields.email,
          emailOption: fields.emailOption,
          title: fields.title,
          location: fields.location,
          employmentType: fields.employmentType,
          track: fields.track,
          area: fields.area,
          korean: fields.korean,
          description: fields.description,
          pinned: fields.pinned,
          logo,
        },
        password,
      );
    },
  });

  function submitJob(password: string) {
    if (!fields) return;
    setBotCheckError("");
    mutation.mutate(
      { fields, password, file: photos[0]?.file },
      {
        onSuccess: (result) => {
          if (result.kind === "botCheckFailed") {
            setBotCheckError("That password is wrong.");
            return;
          }
          if (result.kind === "invalid") {
            setErrors(result.errors);
            setReady(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          sessionStorage.setItem(
            "jobDraft",
            JSON.stringify({ ...fields, id: result.id }),
          );
          sessionStorage.setItem("payTarget", "job");
          navigate("/pay");
        },
      },
    );
  }

  function handlePhotosChange(e: ChangeEvent<HTMLInputElement>) {
    addPhotos(e, (photoError) => {
      setErrors((prev) => {
        const next = { ...prev };
        if (photoError) next.logo = photoError;
        else delete next.logo;
        return next;
      });
    });
  }

  return (
    <>
      <Form
        noValidate
        onSubmit={(e) => {
          const data = new FormData(e.currentTarget);
          const next = validateJob(data);
          setSubmitted(true);
          setErrors(next);
          if (Object.keys(next).length > 0) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          setFields({
            email: String(data.get("email") ?? ""),
            emailOption: String(data.get("emailOption") ?? ""),
            title: String(data.get("title") ?? ""),
            location: String(data.get("location") ?? ""),
            employmentType: String(data.get("employmentType") ?? ""),
            track: String(data.get("track") ?? "") as
              | "Teaching"
              | "Non-teaching"
              | "",
            area: String(data.get("area") ?? ""),
            korean: String(data.get("korean") ?? ""),
            description: String(data.get("description") ?? ""),
            pinned: data.get("pinned") === "on",
            method: String(data.get("method") ?? ""),
          });
          setReady(true);
        }}
        onChange={(e) => {
          if (!submitted) return;
          const data = new FormData(e.currentTarget);
          if (
            e.target instanceof HTMLSelectElement &&
            e.target.name === "track"
          ) {
            data.set("area", "");
          }
          setErrors(validateJob(data));
        }}
      >
        <FormErrorSummary count={Object.keys(errors).length} />

        <fieldset
          disabled={ready}
          className="field-fieldset m-0 flex min-w-0 flex-col gap-5 p-0"
        >
          <FormField label="Email address:" error={errors.email}>
            <TextInput
              type="email"
              name="email"
              required
              defaultValue={draft?.email ?? ""}
              invalid={Boolean(errors.email)}
            />
          </FormField>

          <RadioGroup
            legend="Email options:"
            name="emailOption"
            options={formRules.jobs.emailOption.options}
            defaultValue={draft?.emailOption === "show" ? "show" : "hide"}
            error={errors.emailOption}
          />

          <FormField label="Post title:" error={errors.title}>
            <TextInput
              type="text"
              name="title"
              required
              defaultValue={draft?.title ?? ""}
              invalid={Boolean(errors.title)}
            />
          </FormField>

          <PhotoUpload
            label="Attach photo:"
            error={errors.logo}
            photos={photos}
            max={MAX_PHOTOS}
            accept={photoRules.allowedTypes.join(",")}
            onChange={handlePhotosChange}
            onRemove={removePhoto}
          />

          <FormField label="Location:" error={errors.location}>
            <TextInput
              type="text"
              name="location"
              required
              defaultValue={draft?.location ?? ""}
              invalid={Boolean(errors.location)}
            />
          </FormField>

          <FormField label="Employment type:" error={errors.employmentType}>
            <SelectInput
              name="employmentType"
              required
              defaultValue={draft?.employmentType ?? ""}
              invalid={Boolean(errors.employmentType)}
            >
              <option value="" disabled>
                Select…
              </option>
              {formRules.jobs.employmentType.options.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Teaching / non-teaching:" error={errors.track}>
            <SelectInput
              name="track"
              required
              value={track}
              invalid={Boolean(errors.track)}
              onChange={(e) =>
                setTrack(e.target.value as "Teaching" | "Non-teaching" | "")
              }
            >
              <option value="" disabled>
                Select…
              </option>
              {Object.keys(formRules.jobs.track.options).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Job area:" error={errors.area}>
            <SelectInput
              name="area"
              required
              disabled={!track}
              key={track || "none"}
              defaultValue={draft?.area ?? ""}
              invalid={Boolean(errors.area)}
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

          <FormField label="Korean requirement:" error={errors.korean}>
            <SelectInput
              name="korean"
              required
              defaultValue={draft?.korean ?? ""}
              invalid={Boolean(errors.korean)}
            >
              <option value="" disabled>
                Select…
              </option>
              {formRules.jobs.korean.options.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Post description:" error={errors.description}>
            <TextareaInput
              name="description"
              rows={8}
              required
              defaultValue={draft?.description ?? ""}
              invalid={Boolean(errors.description)}
            />
          </FormField>

          <PinField
            label="Show at the top of the job board"
            defaultChecked={draft?.pinned ?? false}
          />
          <RadioGroup
            legend="How to pay:"
            name="method"
            options={formRules.payment.options}
            defaultValue={draft?.method || "mock"}
          />
        </fieldset>
        {!ready ? (
          <Button type="submit" extraClass="mt-2">
            Send
          </Button>
        ) : null}
      </Form>
      {ready && fields ? (
        <BotCheck
          onSubmit={submitJob}
          pending={mutation.isPending}
          error={botCheckError || mutation.error?.message || ""}
        />
      ) : null}
    </>
  );
}
