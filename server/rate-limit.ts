import type { Request, Response, NextFunction } from 'express';

interface RateBucket {
  timestamps: number[];
}

const buckets = new Map<string, RateBucket>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const bucket = buckets.get(key) || { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= maxRequests) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return true;
}

export function createUidRateLimiter(opts: {
  bucketPrefix: string;
  maxRequests: number;
  windowMs: number;
  message: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: 'Please sign in with Google to continue.' });
    }

    const key = `${opts.bucketPrefix}:${uid}`;
    const allowed = checkRateLimit(key, opts.maxRequests, opts.windowMs);
    if (!allowed) {
      return res.status(429).json({
        error: opts.message,
        message: opts.message,
      });
    }

    return next();
  };
}

// /api/chat: 20 requests per minute per uid
export const rateLimitChat = createUidRateLimiter({
  bucketPrefix: 'chat',
  maxRequests: 20,
  windowMs: 60 * 1000,
  message:
    "You've sent quite a few messages in the last minute. Let's pause for a moment—please wait a minute before sending another message.",
});

// /api/report (and /api/escalate): 5 requests per day per uid
export const rateLimitReport = createUidRateLimiter({
  bucketPrefix: 'report',
  maxRequests: 5,
  windowMs: 24 * 60 * 60 * 1000,
  message:
    "You've reached the daily limit of 5 handoff reports to Nic. You can still use Nic's direct booking link to schedule a time.",
});

// /api/summarize: 20 requests per hour per uid
export const rateLimitSummarize = createUidRateLimiter({
  bucketPrefix: 'summarize',
  maxRequests: 20,
  windowMs: 60 * 60 * 1000,
  message:
    "You've reached the hourly limit of 20 session summaries. Please wait a little while before generating another summary.",
});

// /api/report/draft: 10 requests per hour per uid
export const rateLimitReportDraft = createUidRateLimiter({
  bucketPrefix: 'reportDraft',
  maxRequests: 10,
  windowMs: 60 * 60 * 1000,
  message:
    "You've reached the hourly limit of 10 report drafts. You can still type or edit your note to Nic directly.",
});

