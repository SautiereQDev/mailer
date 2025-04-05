import rateLimit from 'express-rate-limit';

const options = {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 5 requests max per IP
  message: 'Trop de tentatives, veuillez réessayer plus tard',
};

export const limiter = rateLimit(options);

export default limiter;
