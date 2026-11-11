export const config = {
  postKinds: ["job", "market", "service"],
  landing: { jobs: 3, market: 3, services: 3 },
  pageSize: { jobs: 10, market: 9, services: 9 },
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
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    emailOption: {
      required: true,
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
    title: { required: true, minLength: 5, maxLength: 120 },
    photos: {
      required: false,
      max: 1,
      maxBytes: 2 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    },
    location: { required: true, maxLength: 100 },
    employmentType: {
      required: true,
      options: ["Full Time", "Part Time", "Internship"] as readonly string[],
    },
    track: {
      required: true,
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
      required: true,
      options: [
        "No Korean required",
        "Basic Korean required",
        "Conversational Korean required",
        "Fluent Korean required",
      ] as readonly string[],
    },
    description: { required: true, minLength: 40, maxLength: 5000 },
  },
  market: {
    copy: {
      label: "Market",
      title: "Post to market",
      privacy:
        "Your listing may appear on the market for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    emailOption: {
      required: true,
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
    title: { required: true, maxLength: 120 },
    photos: {
      required: false,
      max: 3,
      maxBytes: 2 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    },
    location: { required: true, maxLength: 100 },
    listingType: {
      required: true,
      options: ["Selling", "Wanted", "Free"] as readonly string[],
    },
    category: {
      required: true,
      options: ["Furniture", "Electronics", "Clothing", "Kitchen", "Books", "Sports"] as readonly string[],
    },
    price: { required: true, maxLength: 120 },
    description: { required: true, minLength: 40, maxLength: 5000 },
  },
  service: {
    copy: {
      label: "Service",
      title: "Post a service",
      privacy:
        "Your service may appear on English Services for foreigners living in Korea. Include only details you are comfortable sharing publicly. pyeonhee does not sell your information or use it for ads.",
    },
    company: { required: true, maxLength: 120 },
    category: {
      required: true,
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
    location: { required: true, maxLength: 100 },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    webpage: {
      required: false,
      pattern: /^https?:\/\/.+/i,
    },
    message: { required: true, minLength: 40, maxLength: 5000 },
    photos: {
      required: false,
      max: 1,
      maxBytes: 2 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    },
  },
  promotion: {
    required: true,
    options: ["standard", "pinned"],
  },
  payment: {
    required: true,
    options: [{ value: "mock", label: "Mock" }],
  },
} as const;

export const postCopy = {
  job: formRules.jobs.copy,
  market: formRules.market.copy,
  service: formRules.service.copy,
} as const;