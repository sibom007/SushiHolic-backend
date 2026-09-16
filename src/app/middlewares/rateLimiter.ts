import rateLimit, { type Options } from "express-rate-limit";

export const createRateLimiter = (options: Partial<Options> = {}) => {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: 100,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },

    ...options,
  });
};
