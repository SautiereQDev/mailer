import { Request, Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import HttpStatusCodes from '@src/common/HttpStatusCodes';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ApiKeyController {
  /**
   * Crée une nouvelle clé API
   */
  public static async createApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { name, ownerId, expiresInDays } = req.body as {
        name: string;
        ownerId: string;
        expiresInDays?: number;
      };

      if (!name || !ownerId) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Le nom et l'identifiant du propriétaire sont requis",
        });
        return;
      }

      const apiKey = await ApiKeyService.createApiKey(name, ownerId, expiresInDays);

      res.status(HttpStatusCodes.CREATED).json({
        message: 'Clé API créée avec succès',
        apiKey, // Affichée uniquement à la création
      });
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la création de la clé API',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Révoque une clé API existante
   */
  public static async revokeApiKey(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await ApiKeyService.revokeApiKey(id);

      if (!success) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: 'Clé API non trouvée',
        });
        return;
      }

      res.status(HttpStatusCodes.OK).json({
        message: 'Clé API révoquée avec succès',
      });
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la révocation de la clé API',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * Récupère les clés API d'un propriétaire
   */
  public static async getApiKeysByOwnerId(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.params;
      const apiKeys = await ApiKeyService.getApiKeysByOwnerId(ownerId);

      res.status(HttpStatusCodes.OK).json({
        apiKeys,
      });
    } catch (error) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la récupération des clés API',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
