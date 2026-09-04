import { useState, useEffect, type ChangeEvent, useRef } from "react";
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
  emailOptionLabels,
  koreanLevels,
  employmentTypes,
  marketListingTypes,
  marketCategories,
  kinds,
} from "./constants";

function emailRadioOptions() {
  return [
    {
      value: "relay",
      label: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {emailOptionLabels.relay}
          <FaqHelpLink />
        </span>
      ),
    },
    { value: "real", label: emailOptionLabels.real },
    { value: "none", label: emailOptionLabels.none },
  ];
}

function JobPostForm() {
  const [track, setTrack] = useState<"teaching" | "non-teaching" | "">("");
  const areas = track === "teaching" ? teachingAreas : nonTeachingAreas;

  return (
    <Form>
      <FormField label="Email address:">
        <TextInput type="email" name="email" required />
      </FormField>

      <RadioGroup
        legend="Email options:"
        name="emailOption"
        options={emailRadioOptions()}
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
  const MAX_PHOTOS = 3;
  const [listingType, setListingType] = useState<string>("");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);

  function handlePhotosChange(e: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const added = chosen.slice(0, room).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...added];
    });
    e.target.value = "";
  }

  function removePhoto(url: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.url === url);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.url !== url);
    });
  }

  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  return (
    <Form>
      <FormField label="Email address:">
        <TextInput type="email" name="email" required />
      </FormField>

      <RadioGroup
        legend="Email options:"
        name="emailOption"
        options={emailRadioOptions()}
        defaultValue="relay"
      />

      <FormField label="Post title:">
        <TextInput type="text" name="title" required />
      </FormField>

      <FormField label="Location:">
        <TextInput type="text" name="location" required />
      </FormField>

      <FormField label="Listing type:">
        <SelectInput
          name="listingType"
          required
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
        >
          <option value="" disabled>
            Select…
          </option>
          {marketListingTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <FormField label="Category:">
        <SelectInput
          name="category"
          required
          disabled={!listingType}
          key={listingType || "none"}
          defaultValue=""
        >
          <option value="" disabled>
            {listingType ? "Select…" : "Select listing type first"}
          </option>
          {listingType &&
            marketCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </SelectInput>
      </FormField>

      <FormField label="Price:">
        <TextInput
          type="text"
          name="price"
          required
          placeholder="e.g. ₩50,000 or Negotiable"
        />
      </FormField>

      <FormField label="Attach photos:">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label
              className={`inline-flex cursor-pointer items-center justify-center rounded border-[1.5px] border-text-dark bg-white px-3 py-2 font-sans text-[15px] text-text-dark ${
                photos.length >= MAX_PHOTOS
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-yellow"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={photos.length >= MAX_PHOTOS}
                onChange={handlePhotosChange}
                className="sr-only"
              />
              Add photos
            </label>
            <span className="text-[15px] text-muted">
              {photos.length}/{MAX_PHOTOS}
            </span>
          </div>

          {photos.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {photos.map((photo) => (
                <li key={photo.url} className="relative">
                  <img
                    src={photo.url}
                    alt=""
                    className="h-20 w-20 rounded border-[1.5px] border-text-dark object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.url)}
                    aria-label="Remove photo"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-text-dark bg-white text-xs leading-none text-text-dark"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </FormField>

      <FormField label="Description:">
        <TextareaInput name="description" rows={8} required />
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
          <BackLink to="/post">back to post</BackLink>
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
