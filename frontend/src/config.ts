export const config = {
  postKinds: ["job", "market", "service"],
  feed: {
    initialCount: 20,
    batchSize: 20,
  },
} as const;

// Must match backend/internal/app/rules.go.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBPAGE_PATTERN = /^https?:\/\/.+/i;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

const EMAIL_RULE = { maxLength: 254, pattern: EMAIL_PATTERN } as const;
const TITLE_RULE = { minLength: 2, maxLength: 120 } as const;
const LOCATION_RULE = { minLength: 2, maxLength: 100 } as const;
const BODY_RULE = { minLength: 40, maxLength: 5000 } as const;
const SHORT_MESSAGE_RULE = { minLength: 10, maxLength: 2000 } as const;

export const formRules = {
  jobs: {
    copy: {
      label: "Job",
      title: "Post a job",
      privacy:
        "Your job post may appear on the job board for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
    },
    email: EMAIL_RULE,
    emailOption: {
      options: [
        {
          value: "hide",
          label: "Hide email. Your email address won't be shown in the post.",
        },
        {
          value: "show",
          label: "Show email. The post will show your email address.",
        },
      ],
    },
    title: TITLE_RULE,
    photos: {
      max: 1,
      maxBytes: MAX_PHOTO_BYTES,
      allowedTypes: ALLOWED_PHOTO_TYPES,
    },
    location: LOCATION_RULE,
    employmentType: {
      options: ["Full Time", "Part Time", "Internship"] as readonly string[],
    },
    track: {
      options: {
        Teaching: [
          "English Teaching",
          "High School",
          "University",
          "Kindergarten",
          "Private Tutoring",
        ],
        "Non-teaching": [
          "Front End",
          "Back End",
          "Accounting",
          "Hospitality",
          "Marketing",
          "Design",
          "Customer Service",
          "Sports",
          "Other",
        ],
      } as Record<string, readonly string[]>,
    },
    korean: {
      options: [
        "No Korean required",
        "Basic Korean required",
        "Conversational Korean required",
        "Fluent Korean required",
      ] as readonly string[],
    },
    description: BODY_RULE,
  },
  market: {
    copy: {
      label: "Market",
      title: "Post to market",
      privacy:
        "Your listing may appear on the market for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
    },
    email: EMAIL_RULE,
    emailOption: {
      options: [
        {
          value: "hide",
          label: "Hide email. Your email address won't be shown in the post.",
        },
        {
          value: "show",
          label: "Show email. The post will show your email address.",
        },
      ],
    },
    title: TITLE_RULE,
    photos: {
      max: 3,
      maxBytes: MAX_PHOTO_BYTES,
      allowedTypes: ALLOWED_PHOTO_TYPES,
    },
    location: LOCATION_RULE,
    listingType: {
      options: ["Selling", "Wanted", "Free"] as readonly string[],
    },
    category: {
      options: ["Furniture", "Electronics", "Clothing", "Kitchen", "Books", "Sports"] as readonly string[],
    },
    price: { maxLength: 60 },
    description: BODY_RULE,
  },
  service: {
    copy: {
      label: "Service",
      title: "Post a service",
      privacy:
        "Your service may appear on English Services for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
    },
    company: TITLE_RULE,
    category: {
      options: [
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
      ] as readonly string[],
    },
    location: LOCATION_RULE,
    email: EMAIL_RULE,
    webpage: {
      maxLength: 500,
      pattern: WEBPAGE_PATTERN,
    },
    message: BODY_RULE,
    photos: {
      max: 1,
      maxBytes: MAX_PHOTO_BYTES,
      allowedTypes: ALLOWED_PHOTO_TYPES,
    },
  },
  contact: {
    email: EMAIL_RULE,
    message: SHORT_MESSAGE_RULE,
  },
  report: {
    email: EMAIL_RULE,
    message: SHORT_MESSAGE_RULE,
  },
  payment: {
    options: [{ value: "mock", label: "Mock" }],
  },
} as const;

export const postCopy = {
  job: formRules.jobs.copy,
  market: formRules.market.copy,
  service: formRules.service.copy,
} as const;

export type NavLink = {
  path: string;
  label: string;
  accent?: boolean;
};

export const navLinks: NavLink[] = [
  { path: "/", label: "Latest posts" },
  { path: "/?kind=job", label: "Work", accent: true },
  { path: "/?kind=market", label: "For Sale", accent: true },
  { path: "/?kind=service", label: "Services", accent: true },
  { path: "/post", label: "Post" },
  { path: "/faq", label: "FAQ" },
];

export type FooterLink = {
  to: string;
  label: string;
};

export const footerLinks: FooterLink[] = [
  { to: "/", label: "Latest posts" },
  { to: "/post", label: "Post" },
  { to: "/faq", label: "FAQ" },
];

export const heroPhrases: readonly [string, string][] = [
  ["Want to share", "things to do"],
  ["Looking for", "work"],
  ["Want to sell", "used items"],
  ["Need", "help in English"],
  ["Hiring for", "your team"],
  ["Hunting for", "secondhand deals"],
  ["Offering", "local services"],
  ["Looking for", "part-time work"],
  ["Moving out of", "your apartment"],
  ["Searching for", "teaching jobs"],
  ["Need", "class cover"],
  ["Giving away", "free furniture"],
  ["Looking for", "private tutoring"],
];

export const suggestedSearches: readonly string[] = [
  "english teaching",
  "seongsu",
  "furniture",
  "visa",
  "free",
  "bike",
  "monitor",
  "housing",
  "moving",
  "part time",
  "itaewon",
  "gangnam",
  "electronics",
];