import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendContactEmail(contact: ContactDto): Promise<void> {
    const { nom, entreprise, email, message, source } = contact;

    try {
      // Préparation du contexte en excluant entreprise si elle est vide
      const context: Record<string, string> = {
        nom,
        email,
        message,
        source,
      };

      // Ajouter entreprise seulement si elle existe et n'est pas vide
      if (entreprise && entreprise.trim() !== '') {
        context.entreprise = entreprise;
      }

      await this.mailerService.sendMail({
        to: email, // On envoie une confirmation au contact
        cc: process.env.MAIL_FROM_EMAIL, // On s'envoie une copie
        subject: `Nouveau message de ${nom} ${entreprise ? `(${entreprise})` : ''}`,
        template: 'contact', // nom du fichier .hbs sans extension
        context,
      });
      this.logger.log(`E-mail de contact envoyé pour ${email}`);
    } catch (error) {
      this.logger.error(
        "Erreur lors de l'envoi du mail de contact",
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
