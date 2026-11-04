import { throwIfNotOk } from "../../lib/httpError";

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
  logo?: string,
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
  images?: string[];
  pinned: boolean;
};

export type ServiceFields = {
  company: string;
  category: string;
  location: string;
  email: string;
  webpage: string;
  message: string;
  logo?: string;
};

type CreateResult<Errors> =
  | { kind: "created"; id: string }
  | { kind: "invalid"; errors: Errors }
  | { kind: "botCheckFailed" };

type UploadResult = { kind: "uploaded"; key: string } | { kind: "botCheckFailed" };

export async function createListing<Errors>(
  path: string,
  fields: object,
  password: string,
): Promise<CreateResult<Errors>> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
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

  const { id } = (await res.json()) as { id: string };
  return { kind: "created", id };
}


export async function uploadPhoto(
  path: string,
  file: File,
  password: string,
): Promise<UploadResult> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: file.type,
      contentLength: file.size,
      password,
    }),
  });

  if (res.status === 401) return { kind: "botCheckFailed" };
  throwIfNotOk(res);

  const { key, uploadUrl } = (await res.json()) as { key: string; uploadUrl: string };
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  throwIfNotOk(put);
  return { kind: "uploaded", key };
}
