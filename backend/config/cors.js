const getAllowedOrigins = () => {
  const fromEnv = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
  return fromEnv;
};

const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return true;

  // Allow all Vercel preview and production deployments
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true;

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
};

module.exports = { corsOptions, isOriginAllowed, getAllowedOrigins };
