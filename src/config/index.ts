import { verifyRequiredEnvs } from '../utils/verifyEnvs';

verifyRequiredEnvs(['JWT_SECRET']);

export const config = {
  PORT: parseInt(process.env.PORT as string, 10) || 3000,
  API_BASE: process.env.API_BASE || '/api',
  JWT_TTL: process.env.JWT_TTL || '5m',
  JWT_SECRET: process.env.JWT_SECRET || '',
};
