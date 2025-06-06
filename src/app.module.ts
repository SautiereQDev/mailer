import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    // Chargement des variables d'environnement depuis .env
    ConfigModule.forRoot({ isGlobal: true }),

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
                // Configuration pour production
                host: config.get<string>('MAIL_HOST'),
                port: config.get<number>('MAIL_PORT'),
                secure: false,
                auth: {
                  user: config.get<string>('MAIL_USER'),
                  pass: config.get<string>('MAIL_PASSWORD'),
                },
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
})
export class AppModule {}
