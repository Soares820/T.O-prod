// Simple in-memory rate limiter for Vercel serverless functions
// Usage: wrap your handler with withRateLimit(handler, { max, windowMs })

const store = new Map();

function withRateLimit(handler, opts = {}) {
  const max      = opts.max      || 20;
  const windowMs = opts.windowMs || 60_000; // 1 minute default

  return async (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
              || req.socket?.remoteAddress
              || 'unknown';
    const key  = `${ip}:${req.url}`;
    const now  = Date.now();
    const entry = store.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count   = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count++;
    store.set(key, entry);

    res.setHeader('X-RateLimit-Limit',     String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.setHeader('X-RateLimit-Reset',     String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      return res.status(429).json({
        error: 'Muitas requisições. Tente novamente em alguns instantes.',
      });
    }

    return handler(req, res);
  };
}

module.exports = { withRateLimit };
