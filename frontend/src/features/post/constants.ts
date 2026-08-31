export const serviceFilters = [
  "Visa",
  "Translation",
  "Legal",
  "Housing",
  "Banking",
  "Phone & SIM",
  "Moving",
  "Tutoring",
  "Healthcare",
  "Business setup",
] as const;

export const employmentTypes = [
  "Full Time",
  "Part Time",
  "Internship",
] as const;

export const teachingAreas = [
  "English Teaching",
  "High School",
  "University",
  "Kindergarten",
  "Private Tutoring",
] as const;

export const nonTeachingAreas = [
  "Front End",
  "Back End",
  "Accounting",
  "Hospitality",
  "Marketing",
  "Design",
  "Customer Service",
  "Sports",
  "Other",
] as const;

export const koreanLevels = [
  "No Korean required",
  "Basic Korean required",
  "Conversational Korean required",
  "Fluent Korean required",
] as const;

export const emailOptions = [
  { value: "real", label: "Show my real email address" },
  { value: "none", label: "No replies to email" },
] as const;

export const kinds = {
  job: {
    title: "Post a job",
    privacy:
      "Your job post may appear on the job board for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
  },
  market: {
    title: "Post to market",
    privacy:
      "Your listing may appear on the market for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
  },
  service: {
    title: "Post a service",
    privacy:
      "Your service may appear on English Services for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
  },
} as const;
