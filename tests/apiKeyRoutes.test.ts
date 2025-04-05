import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import apiKeysRouter from '../src/routes/apiKeys';
import { ApiKeyService } from '../src/services/apiKeyService';
import HttpStatusCodes from '../src/common/HttpStatusCodes';
import app from '../src/server';

// Mock du middleware d'authentification
vi.mock('../src/midlewares/adminAuth', () => {
  return {
    default: (req: any, res: any, next: any) => next(),
  };
});

// Mock du service ApiKey
vi.mock('../src/services/apiKeyService', () => {
  return {
    ApiKeyService: {
      createApiKey: vi.fn(),
      revokeApiKey: vi.fn(),
      getApiKeysByOwnerId: vi.fn(),
      validateApiKey: vi.fn(),
    },
  };
});

describe('Routes API Key', () => {
  let app: Express;

  beforeEach(() => {
    // Reset des mocks entre les tests
    vi.resetAllMocks();

    // Configuration de l'application Express pour les tests
    app = express();
    app.use(express.json());
    app.use('/mailer/api-keys', apiKeysRouter);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('devrait renvoyer une erreur 400 si le nom ou ownerId manque', async () => {
    // Cas 1: Sans nom
    let response = await request(app).post('/mailer/api-keys').send({
      ownerId: 'user123',
    });

    expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);

    // Cas 2: Sans ownerId
    response = await request(app).post('/mailer/api-keys').send({
      name: 'Test API Key',
    });

    expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
  });

  it('devrait gérer les erreurs du service', async () => {
    // Configuration du mock pour simuler une erreur
    (ApiKeyService.createApiKey as any).mockRejectedValue(new Error('Erreur test'));

    // Exécution de la requête
    const response = await request(app).post('/mailer/api-keys').send({
      name: 'Test API Key',
      ownerId: 'user123',
    });

    // Assertions
    expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe('Erreur lors de la création de la clé API');
    expect(response.body.error).toBe('Erreur test');
  });
});

describe('DELETE /api-keys/:id', () => {
  it('devrait révoquer une clé API avec succès', async () => {
    // Configuration du mock
    (ApiKeyService.revokeApiKey as any).mockResolvedValue(true);

    // Exécution de la requête
    const response = await request(app).delete('/mailer/api-keys/key123');

    // Assertions
    expect(response.status).toBe(HttpStatusCodes.OK);
    expect(response.body.message).toBe('Clé API révoquée avec succès');
    expect(ApiKeyService.revokeApiKey).toHaveBeenCalledWith('key123');
  });

  it("devrait renvoyer une erreur 404 si la clé API n'existe pas", async () => {
    // Configuration du mock
    (ApiKeyService.revokeApiKey as any).mockResolvedValue(false);

    // Exécution de la requête
    const response = await request(app).delete('/mailer/api-keys/unknown-key');

    // Assertions
    expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    expect(response.body.message).toBe('Clé API non trouvée');
  });

  it('devrait gérer les erreurs du service', async () => {
    // Configuration du mock pour simuler une erreur
    (ApiKeyService.revokeApiKey as any).mockRejectedValue(new Error('Erreur test'));

    // Exécution de la requête
    const response = await request(app).delete('/mailer/api-keys/key123');

    // Assertions
    expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe('Erreur lors de la révocation de la clé API');
    expect(response.body.error).toBe('Erreur test');
  });
});

// Test supplémentaire pour une route GET que vous pourriez implémenter
describe('GET /api-keys/owner/:ownerId', () => {
  it("devrait récupérer les clés API d'un propriétaire", async () => {
    // Cette route n'existe pas encore, mais vous pourriez l'ajouter
    const mockApiKeys = [
      {
        id: 'key1',
        name: 'Key 1',
        key: 'key1-ke...',
        hashedKey: 'hashed-key1',
        createdAt: new Date().toISOString(),
        ownerId: 'user123',
        isActive: true,
        expiresAt: null,
        lastUsedAt: null,
      },
    ];

    (ApiKeyService.getApiKeysByOwnerId as any).mockResolvedValue(mockApiKeys);

    const response = await request(app).get('/mailer/api-keys/owner/user123');

    expect(response.status).toBe(HttpStatusCodes.OK);
    expect(response.body.apiKeys).toEqual(mockApiKeys);
    expect(ApiKeyService.getApiKeysByOwnerId).toHaveBeenCalledWith('user123');
  });
});
