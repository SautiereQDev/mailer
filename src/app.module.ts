import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ContactModule } from './contact/contact.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BlacklistModule } from './blacklist/blacklist.module';
import { BlacklistGuard } from './blacklist/blacklist.guard';

@Module({
  imports: [
    // Chargement des variables d'environnement depuis .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Protection contre les DDoS
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: 60000, // Time window (1 minute)
          limit: 20, // Max 20 requests per IP per minute
        },
      ],
    }),

    // Module de liste noire
    BlacklistModule,

    // Configuration du module Mailer avec Handlebars pour les templates
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDevelopment = process.env.NODE_ENV !== 'production';

        return {
          transport: isDevelopment
            ? {
                // Configuration pour MailHog en développement
                host: config.get<string>('MAIL_HOST'),
                port: config.get<number>('MAIL_PORT'),
                secure: false,
                // Pas d'authentification pour MailHog
              }
            : {
                // Configuration pour IONOS en production
                host: 'smtp.ionos.fr',
                port: 465,
                secure: true,
                auth: {
                  user: config.get<string>('MAIL_USER'),
                  pass: config.get<string>('MAIL_PASSWORD'),
                },
                debug: true,
                logger: true,
              },
          defaults: {
            from: `"${config.get<string>('MAIL_FROM_NAME')}" <${config.get<string>('MAIL_FROM_EMAIL')}>`,
          },
          template: {
            dir: join(__dirname, 'contact', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),

    ContactModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BlacklistGuard,
    },
  ],
})
export class AppModule {}
