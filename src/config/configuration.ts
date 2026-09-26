export default () => ({
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000').split(','),
  database: {
    url: process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb+srv://simransonaniya77_db_user:Vku0tJvToocNjQCn@cluster0.oubgq77.mongodb.net/interactmd?retryWrites=true&w=majority&appName=Cluster0',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'interactmd_super_secure_jwt_secret_dev_2026_clinical_sim',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  ai: {
    provider: process.env.LLM_PROVIDER || 'mock',
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    },
  },
});
