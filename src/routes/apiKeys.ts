import { Request, Response, Router } from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import adminAuth from '../midlewares/adminAuth';

export const apiKeysRoutes = Router();

// Création d'une clé API (restreint aux administrateurs)
apiKeysRoutes.post('/', adminAuth, async (req: Request, res: Response): Promise<void> => {
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
});

// Route pour révoquer une clé API
apiKeysRoutes.delete('/:id', adminAuth, async (req: Request, res: Response): Promise<void> => {
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
});

apiKeysRoutes.get(
  '/owner/:ownerId',
  adminAuth,
  async (req: Request, res: Response): Promise<void> => {
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
);

export default apiKeysRoutes;
