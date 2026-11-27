export const config = {
  postKinds: ["job", "market", "service"],
  feed: {
    initialCount: 20,
    batchSize: 20,
  },
} as const;

export const formRules = {
  jobs: {
    copy: {
      label: "Job",
      title: "Post a job",
      privacy:
        "Your job post may appear on the job board for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
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
    title: { minLength: 5, maxLength: 120 },
    photos: {
      max: 1,
      maxBytes: 2 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    },
    location: { maxLength: 100 },
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
    description: { minLength: 40, maxLength: 5000 },
  },
  market: {
    copy: {
      label: "Market",
      title: "Post to market",
      privacy:
        "Your listing may appear on the market for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
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
    title: { maxLength: 120 },
    photos: {
      max: 3,
      maxBytes: 2 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    },
    location: { maxLength: 100 },
    listingType: {
      options: ["Selling", "Wanted", "Free"] as readonly string[],
    },
    category: {
      options: ["Furniture", "Electronics", "Clothing", "Kitchen", "Books", "Sports"] as readonly string[],
    },
    price: { maxLength: 120 },
    description: { minLength: 40, maxLength: 5000 },
  },
  service: {
    copy: {
      label: "Service",
      title: "Post a service",
      privacy:
        "Your service may appear on English Services for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
    },
    company: { maxLength: 120 },
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
    location: { maxLength: 100 },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    webpage: {
      pattern: /^https?:\/\/.+/i,
    },
    message: { minLength: 40, maxLength: 5000 },
    photos: {
      max: 1,
      maxBytes: 2 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    },
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