import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProd = process.env.NODE_ENV === 'production';

  // Hardening: security headers (helmet). CSP dimatikan di dev agar GraphQL Playground jalan.
  app.use(
    helmet({
      contentSecurityPolicy: isProd ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS — origin dibatasi via environment variable.
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3001',
      process.env.MOBILE_URL || 'http://localhost:8081',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API Server running on: http://localhost:${port}`);
  if (!isProd) {
    console.log(`⚡ GraphQL Playground active at: http://localhost:${port}/graphql`);
  }
}
bootstrap();
