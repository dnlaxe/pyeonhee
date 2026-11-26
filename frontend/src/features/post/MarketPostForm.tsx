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
import { createListing, uploadPhoto, type MarketFields } from "./api";
import { validateMarket, type MarketErrors } from "./validation";
import { PinField } from "./PinField";

type MarketDraft = {
  email: string;
  emailOption: string;
  title: string;
  location: string;
  listingType: string;
  category: string;
  price: string;
  description: string;
  pinned: boolean;
  method: string;
};

function readMarketDraft(): MarketDraft | null {
  const raw = sessionStorage.getItem("marketDraft");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function MarketPostForm() {
  const photoRules = formRules.market.photos;
  const MAX_PHOTOS = photoRules.max;
  const [draft] = useState(readMarketDraft);
  const [listingType, setListingType] = useState(draft?.listingType ?? "");
  const { photos, addPhotos, removePhoto } = usePhotoFiles(photoRules);
  const [errors, setErrors] = useState<MarketErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [fields, setFields] = useState<MarketDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [botCheckError, setBotCheckError] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({
      fields,
      password,
      files,
    }: {
      fields: MarketFields;
      password: string;
      files: File[];
    }) => {
      const images: string[] = [];
      for (const file of files) {
        const uploaded = await uploadPhoto("/photos", file, password);
        if (uploaded.kind !== "uploaded") return uploaded;
        images.push(uploaded.key);
      }
      return createListing<MarketErrors>(
        "/market",
        {
          email: fields.email,
          emailOption: fields.emailOption,
          title: fields.title,
          location: fields.location,
          listingType: fields.listingType,
          category: fields.category,
          price: fields.price,
          description: fields.description,
          pinned: fields.pinned,
          images,
        },
        password,
      );
    },
  });

  function submitMarket(password: string) {
    if (!fields) return;
    setBotCheckError("");
    mutation.mutate(
      {
        fields,
        password,
        files: photos.map((p) => p.file),
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
          sessionStorage.setItem(
            "marketDraft",
            JSON.stringify({ ...fields, id: result.id }),
          );
          sessionStorage.setItem("payTarget", "market");
          navigate("/pay");
        },
      },
    );
  }

  function handlePhotosChange(e: ChangeEvent<HTMLInputElement>) {
    addPhotos(e, (photoError) => {
      setErrors((prev) => {
        const next = { ...prev };
        if (photoError) next.images = photoError;
        else delete next.images;
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
          const next = validateMarket(data);
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
            listingType: String(data.get("listingType") ?? ""),
            category: String(data.get("category") ?? ""),
            price: String(data.get("price") ?? ""),
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
            e.target.name === "listingType"
          ) {
            data.set("category", "");
          }
          setErrors(validateMarket(data));
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
            options={formRules.market.emailOption.options}
            defaultValue={draft?.emailOption === "show" ? "show" : "hide"}
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
          <FormField label="Location:" error={errors.location}>
            <TextInput
              type="text"
              name="location"
              required
              defaultValue={draft?.location ?? ""}
              invalid={Boolean(errors.location)}
            />
          </FormField>
          <FormField label="Listing type:" error={errors.listingType}>
            <SelectInput
              name="listingType"
              required
              value={listingType}
              invalid={Boolean(errors.listingType)}
              onChange={(e) => setListingType(e.target.value)}
            >
              <option value="" disabled>
                Select…
              </option>
              {formRules.market.listingType.options.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Category:" error={errors.category}>
            <SelectInput
              name="category"
              required
              disabled={!listingType}
              key={listingType || "none"}
              defaultValue={draft?.category ?? ""}
              invalid={Boolean(errors.category)}
            >
              <option value="" disabled>
                {listingType ? "Select…" : "Select listing type first"}
              </option>
              {listingType &&
                formRules.market.category.options.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </SelectInput>
          </FormField>

          <FormField label="Price:" error={errors.price}>
            <TextInput
              type="text"
              name="price"
              required
              placeholder="e.g. ₩50,000 or Negotiable"
              defaultValue={draft?.price ?? ""}
              invalid={Boolean(errors.price)}
            />
          </FormField>

          <PhotoUpload
            label="Attach photos:"
            error={errors.images}
            photos={photos}
            max={MAX_PHOTOS}
            accept={photoRules.allowedTypes.join(",")}
            multiple
            onChange={handlePhotosChange}
            onRemove={removePhoto}
          />

          <FormField label="Description:" error={errors.description}>
            <TextareaInput
              name="description"
              rows={8}
              required
              defaultValue={draft?.description ?? ""}
              invalid={Boolean(errors.description)}
            />
          </FormField>

          <PinField
            label="Show at the top of the market"
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
          onSubmit={submitMarket}
          pending={mutation.isPending}
          error={botCheckError || mutation.error?.message || ""}
        />
      ) : null}
    </>
  );
}
