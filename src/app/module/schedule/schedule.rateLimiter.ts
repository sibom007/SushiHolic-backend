import { createRateLimiter } from "../../middlewares/rateLimiter";

const scheduleReadLimiter = createRateLimiter({
  limit: 100,
  
});

const scheduleMutationLimiter = createRateLimiter({
  limit: 20,
});
