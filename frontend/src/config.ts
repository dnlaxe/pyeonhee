export const config = {
  landing: { jobs: 3, market: 3, services: 3 },
  pageSize: { jobs: 10, market: 9, services: 9 },
  maxPhotos: { job: 1, market: 3, service: 1 },
  minDescriptionLength: 40,
} as const;