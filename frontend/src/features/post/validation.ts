import { formRules } from "../../config";

export type JobErrors = {
  email?: string;
  title?: string;
  location?: string;
  employmentType?: string;
  track?: string;
  area?: string;
  korean?: string;
  description?: string;
  logo?: string,
};

export function validateJob(data: FormData): JobErrors {
  const errors: JobErrors = {};
  const rules = formRules.jobs;

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
  } else if (!rules.email.pattern.test(email)) {
    errors.email = "Enter a full email address, like name@example.com.";
  }

  if (title === "") {
    errors.title = "Add a post title.";
  } else if (title.length < rules.title.minLength) {
    errors.title = "Make the title a little longer.";
  } else if (title.length > rules.title.maxLength) {
    errors.title = "Shorten the post title.";
  }

  if (location === "") {
    errors.location = "Add a location.";
  } else if (location.length > rules.location.maxLength) {
    errors.location = "Shorten the location.";
  }

  if (!rules.employmentType.options.includes(employmentType)) {
    errors.employmentType = "Choose an employment type.";
  }

  if (!(track in rules.track.options)) {
    errors.track = "Choose teaching or non-teaching.";
  } else if (!rules.track.options[track].includes(area)) {
    errors.area = "Choose a job area.";
  }

  if (!rules.korean.options.includes(korean)) {
    errors.korean = "Choose a Korean requirement.";
  }

  if (description === "") {
    errors.description = "Add a description.";
  } else if (description.length < rules.description.minLength) {
    errors.description = "Add a little more detail about the job.";
  } else if (description.length > rules.description.maxLength) {
    errors.description = "Shorten the description.";
  }

  return errors;
}

export type MarketErrors = {
  email?: string;
  title?: string;
  location?: string;
  listingType?: string;
  category?: string;
  price?: string;
  description?: string;
  images?: string;
};

export function validateMarket(data: FormData): MarketErrors {
  const errors: MarketErrors = {};
  const rules = formRules.market;

  const email = String(data.get("email") ?? "").trim();
  const title = String(data.get("title") ?? "").trim();
  const location = String(data.get("location") ?? "").trim();
  const listingType = String(data.get("listingType") ?? "").trim();
  const category = String(data.get("category") ?? "").trim();
  const price = String(data.get("price") ?? "").trim();
  const description = String(data.get("description") ?? "").trim();

  if (email === "") {
    errors.email = "Enter an email address.";
  } else if (!rules.email.pattern.test(email)) {
    errors.email = "Enter a full email address, like name@example.com.";
  }

  if (title === "") {
    errors.title = "Add a post title.";
  } else if (title.length > rules.title.maxLength) {
    errors.title = "Shorten the post title.";
  }

  if (location === "") {
    errors.location = "Add a location.";
  } else if (location.length > rules.location.maxLength) {
    errors.location = "Shorten the location.";
  }

  if (!rules.listingType.options.includes(listingType)) {
    errors.listingType = "Choose a listing type.";
  } else if (!rules.category.options.includes(category)) {
    errors.category = "Choose a category.";
  }

  if (price === "") {
    errors.price = "Add a price.";
  } else if (price.length > rules.price.maxLength) {
    errors.price = "Shorten the price.";
  }

  if (description === "") {
    errors.description = "Add a description.";
  } else if (description.length < rules.description.minLength) {
    errors.description = "Add a little more detail about the item.";
  } else if (description.length > rules.description.maxLength) {
    errors.description = "Shorten the description.";
  }

  return errors;
}

export type ServiceErrors = {
  company?: string;
  category?: string;
  location?: string;
  email?: string;
  webpage?: string;
  message?: string;
  logo?: string;
};

export function validateService(data: FormData): ServiceErrors {
  const errors: ServiceErrors = {};
  const rules = formRules.service;

  const company = String(data.get("company") ?? "").trim();
  const category = String(data.get("category") ?? "").trim();
  const location = String(data.get("location") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const webpage = String(data.get("webpage") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (company === "") {
    errors.company = "Add a company name.";
  } else if (company.length > rules.company.maxLength) {
    errors.company = "Shorten the company name.";
  }

  if (!rules.category.options.includes(category)) {
    errors.category = "Choose a service.";
  }

  if (location === "") {
    errors.location = "Add a location.";
  } else if (location.length > rules.location.maxLength) {
    errors.location = "Shorten the location.";
  }

  if (email === "") {
    errors.email = "Enter an email address.";
  } else if (!rules.email.pattern.test(email)) {
    errors.email = "Enter a full email address, like name@example.com.";
  }

  if (webpage !== "" && !rules.webpage.pattern.test(webpage)) {
    errors.webpage = "Enter a full link, like https://example.com.";
  }

  if (message === "") {
    errors.message = "Add a message.";
  } else if (message.length < rules.message.minLength) {
    errors.message = "Add a little more detail about the service.";
  } else if (message.length > rules.message.maxLength) {
    errors.message = "Shorten the message.";
  }

  return errors;
}