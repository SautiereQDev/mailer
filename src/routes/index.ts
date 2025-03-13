import {Request, Response, Router} from 'express';
import {mailerInfo} from '@src/common/staticData';
import {ZodError} from 'zod';
import limiter from '@src/midlewares/rateLimiter';
import transporter from '@src/services/transporter';
import {mailSchema} from '@src/utils/validator';
import emailTemplateService from '@src/services/emailTemplateService';
import HttpStatusCodes from '@src/common/HttpStatusCodes';

/******************************************************************************
                                Variables
******************************************************************************/

const mailerRouter = Router();

mailerRouter.get('/', (req, res) => {
  res.status(HttpStatusCodes.OK).send(mailerInfo);
});

mailerRouter.post('/send', limiter, async (req: Request, res: Response): Promise<void> => {
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
});

/******************************************************************************
                                Export default
******************************************************************************/

export default mailerRouter;
