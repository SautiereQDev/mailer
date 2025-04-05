import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import apiKeysRouter from '../src/routes/apiKeys';
import {baseRoutes} from '../src/routes';
import { ApiKeyService } from '../src/services/apiKeyService';
import transporter from '../src/services/transporter';
import emailTemplateService from '../src/services/emailTemplateService';
import HttpStatusCodes from '../src/common/HttpStatusCodes';
import { mailerInfo } from '../src/common/staticData';
import app from '../src/server';

// Mock des middlewares
vi.mock('../src/midlewares/adminAuth', () => ({
  default: (req: any, res: any, next: any) => next(),
}));

vi.mock('../src/midlewares/apiKeyAuth', () => ({
  default: (req: any, res: any, next: any) => next(),
}));

vi.mock('../src/midlewares/rateLimiter', () => ({
  default: (req: any, res: any, next: any) => next(),
}));

// Mock des services
vi.mock('../src/services/apiKeyService', () => ({
  ApiKeyService: {
    createApiKey: vi.fn(),
    revokeApiKey: vi.fn(),
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

describe('Routes API', () => {
  let app: Express;

  beforeEach(() => {
    vi.resetAllMocks();
    app = express();
    app.use(express.json());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Routes API Key', () => {
    beforeEach(() => {
      app.use('/api-keys', apiKeysRouter);
    });

    describe('POST /api-keys', () => {
      it('devrait créer une nouvelle clé API avec succès', async () => {
        const mockApiKey = 'api-key-123456789';
        (ApiKeyService.createApiKey as any).mockResolvedValue(mockApiKey);

        const response = await request(app).post('/api-keys').send({
          name: 'Test API Key',
          ownerId: 'user123',
          expiresInDays: 30,
        });

        expect(response.status).toBe(HttpStatusCodes.CREATED);
        expect(response.body).toEqual({
          message: 'Clé API créée avec succès',
          apiKey: mockApiKey,
        });
        expect(ApiKeyService.createApiKey).toHaveBeenCalledWith('Test API Key', 'user123', 30);
      });

      it('devrait retourner une erreur 400 si le nom est manquant', async () => {
        const response = await request(app).post('/api-keys').send({
          ownerId: 'user123',
        });

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body.message).toBe("Le nom et l'identifiant du propriétaire sont requis");
      });

      it("devrait retourner une erreur 400 si l'ownerId est manquant", async () => {
        const response = await request(app).post('/api-keys').send({
          name: 'Test API Key',
        });

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body.message).toBe("Le nom et l'identifiant du propriétaire sont requis");
      });

      it('devrait gérer les erreurs du service', async () => {
        (ApiKeyService.createApiKey as any).mockRejectedValue(new Error('Erreur de service'));

        const response = await request(app).post('/api-keys').send({
          name: 'Test API Key',
          ownerId: 'user123',
        });

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body.message).toBe('Erreur lors de la création de la clé API');
        expect(response.body.error).toBe('Erreur de service');
      });
    });

    it("devrait retourner une erreur 404 si la clé API n'existe pas", async () => {
      (ApiKeyService.revokeApiKey as any).mockResolvedValue(false);

      const response = await request(app).delete('/api-keys/unknown-key');

      expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
      expect(response.body.message).toBe('Clé API non trouvée');
    });

    it('devrait gérer les erreurs du service', async () => {
      (ApiKeyService.revokeApiKey as any).mockRejectedValue(new Error('Erreur de service'));

      const response = await request(app).delete('/api-keys/key123');

      expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Erreur lors de la révocation de la clé API');
      expect(response.body.error).toBe('Erreur de service');
    });
  });
});

describe('Routes Mailer', () => {
  beforeEach(() => {
    app.use('/', baseRoutes);
  });

  describe('GET /', () => {
    it('devrait renvoyer les informations du mailer', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(HttpStatusCodes.OK);
      expect(response.text).toBe(mailerInfo);
    });
  });

  describe('POST /send', () => {
    it('devrait envoyer un email avec succès', async () => {
      const mockHtml = '<html lang="fr"><body>Test</body></html>';
      (emailTemplateService.renderTemplate as any).mockResolvedValue(mockHtml);
      (transporter.sendMail as any).mockResolvedValue({ messageId: '123' });

      const emailData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Ceci est un message de test',
      };

      const response = await request(app).post('/send').send(emailData);

      expect(response.status).toBe(HttpStatusCodes.OK);
      expect(response.body.message).toBe('Message envoyé');

      expect(emailTemplateService.renderTemplate).toHaveBeenCalledWith('contact', emailData);
      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: 'contact@quentinsautiere.com',
        replyTo: 'test@example.com',
        to: 'contact@quentinsautiere.com',
        subject: 'Nouveau message de Test User',
        text: `Message de Test User (test@example.com) : Ceci est un message de test`,
        html: mockHtml,
      });
    });

    it('devrait retourner une erreur 400 pour des données invalides', async () => {
      const response = await request(app).post('/send').send({
        // Email manquant
        name: 'Test User',
        message: 'Message de test',
      });

      expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('Données invalides');
      expect(response.body.errors).toBeDefined();
    });

    it('devrait gérer les erreurs internes', async () => {
      (emailTemplateService.renderTemplate as any).mockRejectedValue(new Error('Erreur de rendu'));

      const response = await request(app).post('/send').send({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Message de test',
      });

      expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Erreur serveur');
    });
  });
});
