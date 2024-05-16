import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // total minutes
  max: 100000, // total request
  message: {
    status: 0,
    message: 'Too many requests from this IP, please try again later',
    errorCode: 429
  }
});
