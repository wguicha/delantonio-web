import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  port: parseInt(optional('PORT', '3001'), 10),
  nodeEnv: optional('NODE_ENV', 'development'),
  databaseUrl: optional('DATABASE_URL', ''),
  jwtSecret: optional('JWT_SECRET', 'dev-secret-change-in-production'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),
  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),
  whatsapp: {
    phoneNumberId: optional('WHATSAPP_PHONE_NUMBER_ID', ''),
    accessToken: optional('WHATSAPP_ACCESS_TOKEN', ''),
    businessAccountId: optional('WHATSAPP_BUSINESS_ACCOUNT_ID', ''),
    adminPhone: optional('ADMIN_PHONE', ''),
  },
  pizzeria: {
    lat: parseFloat(optional('PIZZERIA_LAT', '36.7213')),
    lng: parseFloat(optional('PIZZERIA_LNG', '-4.4213')),
    maxRadiusKm: parseFloat(optional('MAX_ORDER_RADIUS_KM', '50')),
  },
  rateLimit: {
    windowMs: parseInt(optional('ORDER_RATE_LIMIT_WINDOW_MS', '3600000'), 10),
    max: parseInt(optional('ORDER_RATE_LIMIT_MAX', '5'), 10),
  },
};
