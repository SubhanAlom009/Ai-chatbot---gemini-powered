const rateLimitMap = new Map();

export function rateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }

  const requests = rateLimitMap.get(identifier);

  // Remove old requests outside the window
  const validRequests = requests.filter((time) => time > windowStart);

  if (validRequests.length >= limit) {
    return false; // Rate limited
  }

  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);

  return true; // Request allowed
}
