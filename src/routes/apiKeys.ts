import { Router } from 'express';
import { ApiKeyController } from '../controllers/apiKeyController';
import adminAuth from '../midlewares/adminAuth';

export const apiKeysRoutes = Router();

// Utilisation de fonctions fléchées pour éviter le problème d'unbound methods
apiKeysRoutes.post('/', adminAuth, (req, res) => ApiKeyController.createApiKey(req, res));
apiKeysRoutes.delete('/:id', adminAuth, (req, res) => ApiKeyController.revokeApiKey(req, res));
apiKeysRoutes.get('/owner/:ownerId', adminAuth, (req, res) =>
  ApiKeyController.getApiKeysByOwnerId(req, res)
);

export default apiKeysRoutes;
