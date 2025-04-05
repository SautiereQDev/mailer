import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express, { Express, NextFunction, Request, Response } from 'express';
import { ApiKeyService } from '../src/services/apiKeyService';
import transporter from '../src/services/transporter';
import emailTemplateService from '../src/services/emailTemplateService';
import HttpStatusCodes from '../src/common/HttpStatusCodes';
// Import des middlewares mockés
import adminAuth from '../src/midlewares/adminAuth';
import apiKeyAuth from '../src/midlewares/apiKeyAuth';
import { apiKeysRoutes, baseRoutes } from '../src/routes';

// Mocks pour les middlewares d'authentification
vi.mock('../src/midlewares/adminAuth', () => ({
  default: vi.fn(),
}));

vi.mock('../src/midlewares/apiKeyAuth', () => ({
  default: vi.fn(),
}));

// Mocks pour les services
vi.mock('../src/services/apiKeyService', () => ({
  ApiKeyService: {
    createApiKey: vi.fn(),
    revokeApiKey: vi.fn(),
    getApiKeysByOwnerId: vi.fn(),
    validateApiKey: vi.fn(),
  },
}));

vi.mock('../src/services/transporter', () => ({
  default: {
    sendMail: vi.fn(),
  },
}));

vi.mock('../src/services/emailTemplateService', () => ({
  default: {
    renderTemplate: vi.fn(),
  },
}));

vi.mock('../src/midlewares/rateLimiter', () => ({
  default: (req: Request, res: Response, next: NextFunction) => next(),
}));

describe('Authentification des routes', () => {
  let app: Express;

  beforeEach(() => {
    vi.resetAllMocks();
    app = express();
    app.use(express.json());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Routes API Key avec authentification admin', () => {
    beforeEach(() => {
      app.use('/mailer/api-keys', apiKeysRoutes);
    });

    describe('POST /api-keys', () => {
      it('devrait renvoyer 401 sans token JWT', async () => {
        (adminAuth as any).mockImplementation((req: Request, res: Response) => {
          res.status(HttpStatusCodes.UNAUTHORIZED).json({
            message: 'Authentification requise',
          });
        });

        const response = await request(app).post('/mailer/api-keys').send({
          name: 'Test API Key',
          ownerId: 'user123',
        });

        expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
        expect(response.body.message).toBe('Authentification requise');
      });

      it('devrait renvoyer 403 avec un token non-admin', async () => {
        (adminAuth as any).mockImplementation((req: Request, res: Response) => {
          res.status(HttpStatusCodes.FORBIDDEN).json({
            message: "Accès refusé: droits d'administrateur requis",
          });
        });

        const response = await request(app).post('/mailer/api-keys').send({
          name: 'Test API Key',
          ownerId: 'user123',
        });

        expect(response.status).toBe(HttpStatusCodes.FORBIDDEN);
        expect(response.body.message).toBe("Accès refusé: droits d'administrateur requis");
      });

      it('devrait accepter la requête avec un token admin valide', async () => {
        (adminAuth as any).mockImplementation((req: Request, res: Response, next: NextFunction) => {
          req.user = { userId: 'admin123', isAdmin: true };
          next();
        });

        (ApiKeyService.createApiKey as any).mockResolvedValue('new-api-key-123');

        const response = await request(app).post('/mailer/api-keys').send({
          name: 'Test API Key',
          ownerId: 'user123',
        });

        expect(response.status).toBe(HttpStatusCodes.CREATED);
        expect(response.body.apiKey).toBe('new-api-key-123');
      });
    });

    describe('DELETE /api-keys/:id', () => {
      it('devrait renvoyer 401 avec token JWT invalide', async () => {
        (adminAuth as any).mockImplementation((req: Request, res: Response) => {
          res.status(HttpStatusCodes.UNAUTHORIZED).json({
            message: "Token d'authentification invalide ou expiré",
          });
        });

        const response = await request(app).delete('/mailer/api-keys/key123');

        expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
        expect(response.body.message).toBe("Token d'authentification invalide ou expiré");
      });
    });

    describe('GET /api-keys/owner/:ownerId', () => {
      it('devrait renvoyer 401 sans token JWT', async () => {
        (adminAuth as any).mockImplementation((req: Request, res: Response) => {
          res.status(HttpStatusCodes.UNAUTHORIZED).json({
            message: 'Authentification requise',
          });
        });

        const response = await request(app).get('/mailer/api-keys/owner/user123');

        expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
      });
    });
  });

  describe('Routes Mailer avec authentification par clé API', () => {
    beforeEach(() => {
      app.use('/mailer',  baseRoutes);
    });

    describe('POST /send', () => {
      it('devrait renvoyer 401 sans clé API', async () => {
        (apiKeyAuth as any).mockImplementation((req: Request, res: Response) => {
          res.status(HttpStatusCodes.UNAUTHORIZED).json({
            message: 'Clé API manquante',
          });
        });

        const response = await request(app).post('/mailer/send').send({
          name: 'Test User',
          email: 'test@example.com',
          message: 'Ceci est un message de test',
        });

        expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
        expect(response.body.message).toBe('Clé API manquante');
      });

      it('devrait renvoyer 403 avec une clé API invalide', async () => {
        (apiKeyAuth as any).mockImplementation((req: Request, res: Response) => {
          res.status(HttpStatusCodes.FORBIDDEN).json({
            message: 'Clé API invalide ou expirée',
          });
        });

        const response = await request(app).post('/mailer/send').set('x-api-key', 'invalid-key').send({
          name: 'Test User',
          email: 'test@example.com',
          message: 'Ceci est un message de test',
        });

        expect(response.status).toBe(HttpStatusCodes.FORBIDDEN);
        expect(response.body.message).toBe('Clé API invalide ou expirée');
      });

      it('devrait accepter la requête avec une clé API valide', async () => {
        (apiKeyAuth as any).mockImplementation(
          (req: Request, res: Response, next: NextFunction) => {
            next();
          }
        );

        (emailTemplateService.renderTemplate as any).mockResolvedValue('<html>Test</html>');
        (transporter.sendMail as any).mockResolvedValue({ messageId: '123' });

        const response = await request(app).post('/mailer/send').set('x-api-key', 'valid-key').send({
          name: 'Test User',
          email: 'test@example.com',
          message: 'Ceci est un message de test',
        });

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body.message).toBe('Message envoyé');
      });

      it('devrait accepter la requête avec une clé API valide en paramètre de requête', async () => {
        (apiKeyAuth as any).mockImplementation(
          (req: Request, res: Response, next: NextFunction) => {
            next();
          }
        );

        (emailTemplateService.renderTemplate as any).mockResolvedValue('<html>Test</html>');
        (transporter.sendMail as any).mockResolvedValue({ messageId: '123' });

        const response = await request(app).post('/mailer/send?apiKey=valid-key').send({
          name: 'Test User',
          email: 'test@example.com',
          message: 'Ceci est un message de test',
        });

        expect(response.status).toBe(HttpStatusCodes.OK);
      });
    });
  });
});
