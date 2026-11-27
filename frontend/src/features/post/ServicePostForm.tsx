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
import {
  createListing,
  toPhotoSpec,
  uploadAllPhotos,
  type PendingUpload,
  type ServiceFields,
} from "./api";
import { validateService, type ServiceErrors } from "./validation";

type ServiceDraft = {
  company: string;
  category: string;
  location: string;
  email: string;
  webpage: string;
  message: string;
  method: string;
};

function readServiceDraft(): ServiceDraft | null {
  const raw = sessionStorage.getItem("serviceDraft");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function ServicePostForm() {
  const photoRules = formRules.service.photos;
  const MAX_PHOTOS = photoRules.max;
  const [draft] = useState(readServiceDraft);
  const { photos, addPhotos, removePhoto } = usePhotoFiles(photoRules);
  const [errors, setErrors] = useState<ServiceErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [fields, setFields] = useState<ServiceDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [botCheckError, setBotCheckError] = useState("");
  const [failedUpload, setFailedUpload] = useState<{
    id: string;
    remaining: PendingUpload[];
  } | null>(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({
      fields,
      password,
      file,
    }: {
      fields: ServiceFields;
      password: string;
      file?: File;
    }) => {
      const created = await createListing<ServiceErrors>(
        "/services",
        {
          company: fields.company,
          category: fields.category,
          location: fields.location,
          email: fields.email,
          webpage: fields.webpage,
          message: fields.message,
          logo: file ? toPhotoSpec(file) : undefined,
        },
        password,
      );
      if (created.kind !== "created") return created;

      if (file) {
        const upload = created.uploads[0];
        if (!upload) throw new Error("Missing upload URL.");
        const remaining = await uploadAllPhotos([
          { file, uploadUrl: upload.uploadUrl },
        ]);
        if (remaining.length > 0) {
          return { kind: "uploadFailed" as const, id: created.id, remaining };
        }
      }
      return { kind: "created" as const, id: created.id };
    },
  });

  const retryUpload = useMutation({
    mutationFn: (remaining: PendingUpload[]) => uploadAllPhotos(remaining),
  });

  function proceedToPay(id: string) {
    if (!fields) return;
    sessionStorage.setItem("serviceDraft", JSON.stringify({ ...fields, id }));
    sessionStorage.setItem("payTarget", "service");
    navigate(`/pay/service/${id}`);
  }

  function submitService(password: string) {
    if (!fields) return;
    setBotCheckError("");
    setFailedUpload(null);
    mutation.mutate(
      {
        fields,
        password,
        file: photos[0]?.file,
      },
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
          if (result.kind === "uploadFailed") {
            setFailedUpload({ id: result.id, remaining: result.remaining });
            return;
          }
          proceedToPay(result.id);
        },
      },
    );
  }

  function handleRetryUpload() {
    if (!failedUpload) return;
    retryUpload.mutate(failedUpload.remaining, {
      onSuccess: (remaining) => {
        if (remaining.length > 0) {
          setFailedUpload({ id: failedUpload.id, remaining });
          return;
        }
        proceedToPay(failedUpload.id);
      },
    });
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
          const next = validateService(data);
          setSubmitted(true);
          setErrors(next);
          if (Object.keys(next).length > 0) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          setFields({
            company: String(data.get("company") ?? ""),
            category: String(data.get("category") ?? ""),
            location: String(data.get("location") ?? ""),
            email: String(data.get("email") ?? ""),
            webpage: String(data.get("webpage") ?? ""),
            message: String(data.get("message") ?? ""),
            method: String(data.get("method") ?? ""),
          });
          setReady(true);
        }}
        onChange={(e) => {
          if (!submitted) return;
          const data = new FormData(e.currentTarget);
          setErrors(validateService(data));
        }}
      >
        <FormErrorSummary count={Object.keys(errors).length} />
        <fieldset
          disabled={ready}
          className="field-fieldset m-0 flex min-w-0 flex-col gap-5 p-0"
        >
          <FormField label="Company name:" error={errors.company}>
            <TextInput
              type="text"
              name="company"
              required
              defaultValue={draft?.company ?? ""}
              invalid={Boolean(errors.company)}
            />
          </FormField>
          <FormField label="Service:" error={errors.category}>
            <SelectInput
              name="category"
              required
              defaultValue={draft?.category ?? ""}
              invalid={Boolean(errors.category)}
            >
              <option value="" disabled>
                Select…
              </option>
              {formRules.service.category.options.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </SelectInput>
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
              invalid={Boolean(errors.location)}
              defaultValue={draft?.location ?? ""}
            />
          </FormField>
          <FormField label="Email address:" error={errors.email}>
            <TextInput
              type="email"
              name="email"
              required
              invalid={Boolean(errors.email)}
              defaultValue={draft?.email ?? ""}
            />
          </FormField>
          <FormField label="Webpage link:" error={errors.webpage}>
            <TextInput
              type="url"
              name="webpage"
              placeholder="https://"
              invalid={Boolean(errors.webpage)}
              defaultValue={draft?.webpage ?? ""}
            />
          </FormField>
          <FormField label="Message:" error={errors.message}>
            <TextareaInput
              name="message"
              rows={8}
              required
              invalid={Boolean(errors.message)}
              defaultValue={draft?.message ?? ""}
            />
          </FormField>

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
      {ready && fields && failedUpload ? (
        <div className="pt-6 flex flex-col gap-3">
          <p className="text-tone-danger m-0">
            Photo upload failed. Your post is saved — retry uploading below.
          </p>
          <Button
            type="button"
            disabled={retryUpload.isPending}
            onClick={handleRetryUpload}
          >
            {retryUpload.isPending ? "Uploading…" : "Retry photo upload"}
          </Button>
        </div>
      ) : ready && fields ? (
        <BotCheck
          onSubmit={submitService}
          pending={mutation.isPending}
          error={botCheckError || mutation.error?.message || ""}
        />
      ) : null}
    </>
  );
}
