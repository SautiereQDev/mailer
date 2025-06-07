import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    });
    const configService = app.get(ConfigService);

    // Configuration CORS
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
      credentials: true,
    });

    // Activation de la validation globale
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: 400,
      }),
    );

    const port = configService.get<number>('APPLICATION_PORT') || 3001;

    // Log de démarrage
    logger.log(`Application environment: ${process.env.NODE_ENV}`);
    logger.log(
      `Mail configuration: ${JSON.stringify({
        host: configService.get('MAIL_HOST'),
        port: configService.get('MAIL_PORT'),
        from: configService.get('MAIL_FROM_EMAIL'),
      })}`,
    );

    await app.listen(port, '0.0.0.0');
    logger.log(`Application démarrée sur le port ${port}`);
  } catch (error) {
    logger.error('Error during application bootstrap:', error);
    throw error;
  }
}
bootstrap();
