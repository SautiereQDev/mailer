import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ContactDto } from './dto/contact.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendContactEmail(contact: ContactDto): Promise<void> {
    const { nom, entreprise, email, message, source } = contact;
    const adminEmail = this.configService.get<string>('MAIL_FROM_EMAIL');

    try {
      // Préparation du contexte
      const context: Record<string, string> = {
        nom,
        email,
        message,
        source,
        date: new Date().toLocaleString('fr-FR'),
      };

      // Ajouter entreprise seulement si elle existe et n'est pas vide
      if (entreprise && entreprise.trim() !== '') {
        context.entreprise = entreprise;
      }

      await this.mailerService.sendMail({
        to: adminEmail, // L'email va à l'administrateur
        from: `"${nom} via Formulaire de Contact" <${email}>`, // L'email apparaît comme venant du contact
        replyTo: email, // Pour répondre directement au contact
        subject: `Nouveau message de contact${entreprise ? ` - ${entreprise}` : ''} - ${source}`,
        template: 'contact',
        context,
      });
      
      this.logger.log(`E-mail de contact reçu de ${email} via ${source}`);
    } catch (error) {
      this.logger.error(
        "Erreur lors de l'envoi du mail de contact",
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
