import { throwIfNotOk } from "../../lib/httpError";
import type { JobErrors } from "./validation";

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

export type CreateJobResult =
  | { kind: "created"; id: string }
  | { kind: "invalid"; errors: JobErrors }
  | { kind: "botCheckFailed" };

export async function createJob(
  fields: JobFields,
  password: string,
): Promise<CreateJobResult> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: fields.email,
      emailOption: fields.emailOption,
      title: fields.title,
      location: fields.location,
      employmentType: fields.employmentType,
      track: fields.track,
      area: fields.area,
      korean: fields.korean,
      description: fields.description,
      logo: fields.logo,
      pinned: fields.pinned,
      password,
    }),
  });

  if (res.status === 400 && res.headers.get("Content-Type") === "application/json") {
    const { errors } = (await res.json()) as { errors: JobErrors };
    return { kind: "invalid", errors };
  }

  if (res.status === 401) return { kind: "botCheckFailed" };
  throwIfNotOk(res);

  const { id } = (await res.json()) as { id: string };
  return { kind: "created", id };
}

export async function uploadJobPhoto(
  file: File,
  password: string,
): Promise<{ kind: "uploaded"; key: string } | { kind: "botCheckFailed" }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs/photos`, {
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