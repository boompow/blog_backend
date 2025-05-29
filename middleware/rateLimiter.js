import { rateLimit } from "express-rate-limit";

function rateLimiter(minute, max) {
  return rateLimit({
    windowMs: minute * 60000,
    limit: max,
    statusCode: 429,
    message: {
      error: true,
      message: `Too many attempts please try again later`,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// limiters for different operations
const loginLimiter = rateLimiter(1, 5);
const signupLimiter = rateLimiter(1, 2);
const profileUpdateLimiter = rateLimiter(60, 30);
const readLimiter = rateLimiter(1, 1000);
const writeLimiter = rateLimiter(1, 60);

export default {
  loginLimiter,
  signupLimiter,
  profileUpdateLimiter,
  readLimiter,
  writeLimiter,
};
