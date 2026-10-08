import { config } from "../../config";

export type JobErrors = {
  email?: string;
  title?: string;
  location?: string;
  employmentType?: string;
  track?: string;
  area?: string;
  korean?: string;
  description?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_DESCRIPTION_LENGTH = config.minDescriptionLength;

export function validateJob(data: FormData): JobErrors {
  const errors: JobErrors = {};

  const email = String(data.get("email") ?? "").trim();
  const title = String(data.get("title") ?? "").trim();
  const location = String(data.get("location") ?? "").trim();
  const employmentType = String(data.get("employmentType") ?? "").trim();
  const track = String(data.get("track") ?? "").trim();
  const area = String(data.get("area") ?? "").trim();
  const korean = String(data.get("korean") ?? "").trim();
  const description = String(data.get("description") ?? "").trim();

  if (email === "") {
    errors.email = "Enter an email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a full email address, like name@example.com.";
  }

  if (title === "") {
    errors.title = "Add a post title.";
  }

  if (location === "") {
    errors.location = "Add a location.";
  }

  if (employmentType === "") {
    errors.employmentType = "Choose an employment type.";
  }

  if (track === "") {
    errors.track = "Choose teaching or non-teaching.";
  } else if (area === "") {
    errors.area = "Choose a job area.";
  }

  if (korean === "") {
    errors.korean = "Choose a Korean requirement.";
  }

  if (description === "") {
    errors.description = "Add a description.";
  } else if (description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = "Add a little more detail about the job.";
  }

  return errors;
}
