import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { mailerInfo } from '@src/common/staticData';
import transporter from '@src/services/transporter';
import { mailSchema } from '@src/utils/validator';
import emailTemplateService from '@src/services/emailTemplateService';
import HttpStatusCodes from '@src/common/HttpStatusCodes';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MailerController {
  /**
   * Renvoie les informations de l'API
   */
  public static getMailerInfo(req: Request, res: Response): void {
    res.status(HttpStatusCodes.OK).send(mailerInfo);
  }

  /**
   * Envoie un email en utilisant les données fournies
   */
  public static async sendEmail(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = mailSchema.parse(req.body);

      const htmlContent = await emailTemplateService.renderTemplate('contact', validatedData);

      await transporter.sendMail({
        from: 'contact@quentinsautiere.com',
        replyTo: validatedData.email,
        to: 'contact@quentinsautiere.com',
        subject: `Nouveau message de ${validatedData.name}`,
        text: `Message de ${validatedData.name} (${validatedData.email}) : ${validatedData.message}`,
        html: htmlContent,
      });

      res.status(HttpStatusCodes.OK).json({ message: 'Message envoyé' });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: 'Données invalides', errors: error.issues });
        return;
      }
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erreur serveur' });
    }
  }
}
