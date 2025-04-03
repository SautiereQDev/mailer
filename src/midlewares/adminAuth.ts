import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import env from '@src/config';

/**
 * Middleware d'authentification pour les routes administratives
 * Vérifie si l'utilisateur possède les droits d'administration
 */
const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Récupération du token JWT depuis les en-têtes
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      message: 'Authentification requise',
    });
    return;
  }

  try {
    // Vérification et décodage du token
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      isAdmin: boolean;
    };

    // Vérification des droits d'administration
    if (!decoded.isAdmin) {
      res.status(HttpStatusCodes.FORBIDDEN).json({
        message: "Accès refusé: droits d'administrateur requis",
      });
      return;
    }

    // Ajout des informations utilisateur à la requête pour une utilisation ultérieure
    req.user = decoded;

    next();
  } catch (error) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      message: "Token d'authentification invalide ou expiré",
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
};

export default adminAuth;
