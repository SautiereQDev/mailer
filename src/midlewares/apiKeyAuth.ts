import { NextFunction, Request, Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import HttpStatusCodes from '@src/common/HttpStatusCodes';

const apiKeyAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Récupération de la clé API (plusieurs méthodes possibles)
  const apiKey = (req.headers['x-api-key'] as string) ?? (req.query.apiKey as string);

  if (!apiKey) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      message: 'Clé API manquante',
    });
    return;
  }

  const isValid = await ApiKeyService.validateApiKey(apiKey);

  if (!isValid) {
    res.status(HttpStatusCodes.FORBIDDEN).json({
      message: 'Clé API invalide ou expirée',
    });
    return;
  }

  next();
};

export default apiKeyAuth;
