import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  mobileUrl: process.env.MOBILE_URL || 'http://localhost:8081',
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'your-super-secret-key-change-this-in-production',
  betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
}));
