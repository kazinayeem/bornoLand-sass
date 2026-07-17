import rateLimit from "express-rate-limit";

const windowMs = 60 * 1000;

export const globalRateLimit = rateLimit({
  windowMs,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

export const authRateLimit = rateLimit({
  windowMs,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again later." },
});

export const writeRateLimit = rateLimit({
  windowMs,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many write requests, please slow down." },
});

export const sensitiveWriteRateLimit = rateLimit({
  windowMs,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many sensitive operations, please slow down." },
});

export const analyticsTrackRateLimit = rateLimit({
  windowMs,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many tracking requests, please slow down." },
});

export const newsletterRateLimit = rateLimit({
  windowMs,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
