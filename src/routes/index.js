"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staticData_1 = require("@src/common/staticData");
const zod_1 = require("zod");
const rateLimiter_1 = __importDefault(require("@src/midlewares/rateLimiter"));
const transporter_1 = __importDefault(require("@src/services/transporter"));
const validator_1 = require("@src/utils/validator");
const emailTemplateService_1 = __importDefault(require("@src/services/emailTemplateService"));
/******************************************************************************
                                Variables
******************************************************************************/
const mailerRouter = (0, express_1.Router)();
mailerRouter.get('/', (req, res) => {
    res.status(200).send(staticData_1.mailerInfo);
});
// TODO: Fair une vue pour le formulaire de contact
mailerRouter.post('/send', rateLimiter_1.default, async (req, res) => {
    try {
        const validatedData = validator_1.mailSchema.parse(req.body);
        const htmlContent = await emailTemplateService_1.default.renderTemplate('contact', validatedData);
        await transporter_1.default.sendMail({
            from: 'contact@quentinsautiere.com',
            replyTo: validatedData.email,
            to: 'contact@quentinsautiere.com',
            subject: `Nouveau message de ${validatedData.name}`,
            text: `Message de ${validatedData.name} (${validatedData.email}) : ${validatedData.message}`,
            html: htmlContent,
        });
        res.status(200).json({ message: 'Message envoyé' });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({ message: 'Données invalides', errors: error.issues });
            return;
        }
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
/******************************************************************************
                                Export default
******************************************************************************/
exports.default = mailerRouter;
