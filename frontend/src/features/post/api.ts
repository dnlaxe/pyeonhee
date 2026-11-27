import { throwIfNotOk } from "../../lib/httpError";

export type PhotoSpec = {
  contentType: string;
  contentLength: number;
};

export type PhotoUpload = {
  key: string;
  uploadUrl: string;
};

export type PendingUpload = {
  file: File;
  uploadUrl: string;
};

export function toPhotoSpec(file: File): PhotoSpec {
  return { contentType: file.type, contentLength: file.size };
}

export type JobFields = {
  email: string;
  emailOption: string;
  title: string;
  location: string;
  employmentType: string;
  track: string;
  area: string;
  korean: string;
  description: string;
  logo?: PhotoSpec;
  pinned: boolean;
};

export type MarketFields = {
  email: string;
  emailOption: string;
  title: string;
  location: string;
  listingType: string;
  category: string;
  price: string;
  description: string;
  images?: PhotoSpec[];
  pinned: boolean;
};

export type ServiceFields = {
  company: string;
  category: string;
  location: string;
  email: string;
  webpage: string;
  message: string;
  logo?: PhotoSpec;
};

type CreateResult<Errors> =
  | { kind: "created"; id: string; uploads: PhotoUpload[] }
  | { kind: "invalid"; errors: Errors }
  | { kind: "botCheckFailed" };

export async function createListing<Errors>(
  path: string,
  fields: object,
  password: string,
): Promise<CreateResult<Errors>> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...fields, password }),
  });

  if (res.status === 400 && res.headers.get("Content-Type") === "application/json") {
    const { errors } = (await res.json()) as { errors: Errors };
    return { kind: "invalid", errors };
  }

  if (res.status === 401) return { kind: "botCheckFailed" };
  throwIfNotOk(res);

  const { id, uploads = [] } = (await res.json()) as {
    id: string;
    uploads?: PhotoUpload[];
  };
  return { kind: "created", id, uploads };
}

export async function uploadAllPhotos(
  items: PendingUpload[],
): Promise<PendingUpload[]> {
  const settled = await Promise.allSettled(
    items.map(async ({ uploadUrl, file }) => {
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      throwIfNotOk(put);
    }),
  );
  return items.filter((_, i) => settled[i].status === "rejected");
}
