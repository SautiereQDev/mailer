import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiKeyRepository } from '../src/repositories/apiKeyRepository';
import { prisma } from '@src/config/prisma';

type PrismaApiKey = {
  id: string;
  name: string;
  hashedKey: string;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  ownerId: string;
  isActive: boolean;
};

vi.mock('@src/config/prisma', () => ({
  prisma: {
    apiKey: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('ApiKeyRepository', () => {
  let repository: ApiKeyRepository;
  let mockApiKey: PrismaApiKey;

  beforeEach(() => {
    repository = new ApiKeyRepository();
    mockApiKey = {
      id: 'test-id',
      name: 'Test Key',
      hashedKey: 'hashed-key-value',
      createdAt: new Date(),
      expiresAt: new Date(),
      lastUsedAt: null,
      ownerId: 'owner-123',
      isActive: true,
    } as const;

    vi.resetAllMocks();
  });

  describe('create', () => {
    it('devrait créer une clé API avec succès', async () => {
      vi.mocked(prisma.apiKey.create).mockResolvedValueOnce(mockApiKey);

      const result = await repository.create(mockApiKey);

      expect(result).toBe(true);
      expect(prisma.apiKey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: mockApiKey.id,
            name: mockApiKey.name,
            hashedKey: mockApiKey.hashedKey,
            ownerId: mockApiKey.ownerId,
            isActive: mockApiKey.isActive,
          }),
        })
      );
    });

    it("devrait retourner false en cas d'échec de création", async () => {
      vi.mocked(prisma.apiKey.create).mockRejectedValueOnce(new Error('DB error'));

      const result = await repository.create(mockApiKey);

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une clé API avec succès', async () => {
      vi.mocked(prisma.apiKey.update).mockResolvedValueOnce(mockApiKey);

      const result = await repository.update(mockApiKey);

      expect(result).toBe(true);
      expect(prisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: mockApiKey.id },
        data: mockApiKey,
      });
    });

    it("devrait retourner false en cas d'échec de mise à jour", async () => {
      vi.mocked(prisma.apiKey.update).mockRejectedValueOnce(new Error('DB error'));

      const result = await repository.update(mockApiKey);

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('devrait retourner une clé API quand trouvée', async () => {
      vi.mocked(prisma.apiKey.findUnique).mockResolvedValueOnce(mockApiKey);

      const result = await repository.findById(mockApiKey.id);

      expect(result).toEqual(mockApiKey);
      expect(prisma.apiKey.findUnique).toHaveBeenCalledWith({
        where: { id: mockApiKey.id },
      });
    });

    it("devrait retourner null quand la clé API n'est pas trouvée", async () => {
      vi.mocked(prisma.apiKey.findUnique).mockResolvedValueOnce(null);

      const result = await repository.findById('id-inexistant');

      expect(result).toBeNull();
    });

    it("devrait retourner null en cas d'erreur", async () => {
      vi.mocked(prisma.apiKey.findUnique).mockRejectedValueOnce(new Error('DB error'));

      const result = await repository.findById(mockApiKey.id);

      expect(result).toBeNull();
    });
  });

  describe('findByHashedKey', () => {
    it('devrait retourner une clé API quand trouvée par clé hashée', async () => {
      vi.mocked(prisma.apiKey.findUnique).mockResolvedValueOnce(mockApiKey);

      const result = await repository.findByHashedKey(mockApiKey.hashedKey);

      expect(result).toEqual(mockApiKey);
      expect(prisma.apiKey.findUnique).toHaveBeenCalledWith({
        where: { hashedKey: mockApiKey.hashedKey },
      });
    });

    it("devrait retourner null quand aucune clé avec ce hash n'est trouvée", async () => {
      vi.mocked(prisma.apiKey.findUnique).mockResolvedValueOnce(null);

      const result = await repository.findByHashedKey('hash-inexistant');

      expect(result).toBeNull();
    });

    it("devrait retourner null en cas d'erreur lors de la recherche par hash", async () => {
      vi.mocked(prisma.apiKey.findUnique).mockRejectedValueOnce(new Error('DB error'));

      const result = await repository.findByHashedKey(mockApiKey.hashedKey);

      expect(result).toBeNull();
    });
  });

  describe('findByOwnerId', () => {
    it('devrait retourner une liste de clés API pour un propriétaire', async () => {
      const mockApiKeys = [mockApiKey, { ...mockApiKey, id: 'test-id-2' }];
      vi.mocked(prisma.apiKey.findMany).mockResolvedValueOnce(mockApiKeys);

      const result = await repository.findByOwnerId(mockApiKey.ownerId);

      expect(result).toEqual(mockApiKeys);
      expect(prisma.apiKey.findMany).toHaveBeenCalledWith({
        where: { ownerId: mockApiKey.ownerId },
      });
    });

    it("devrait retourner un tableau vide quand aucune clé n'est trouvée", async () => {
      vi.mocked(prisma.apiKey.findMany).mockResolvedValueOnce([]);

      const result = await repository.findByOwnerId('owner-inexistant');

      expect(result).toEqual([]);
    });

    it("devrait retourner un tableau vide en cas d'erreur", async () => {
      vi.mocked(prisma.apiKey.findMany).mockRejectedValueOnce(new Error('DB error'));

      const result = await repository.findByOwnerId(mockApiKey.ownerId);

      expect(result).toEqual([]);
    });
  });

  describe('updateLastUsed', () => {
    it('devrait mettre à jour le timestamp de dernière utilisation', async () => {
      const now = new Date();
      vi.mocked(prisma.apiKey.update).mockResolvedValueOnce({ ...mockApiKey, lastUsedAt: now });

      const result = await repository.updateLastUsed(mockApiKey.id, now);

      expect(result).toBe(true);
      expect(prisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: mockApiKey.id },
        data: { lastUsedAt: now },
      });
    });

    it("devrait retourner false en cas d'échec de mise à jour du timestamp", async () => {
      const now = new Date();
      vi.mocked(prisma.apiKey.update).mockRejectedValueOnce(new Error('DB error'));

      const result = await repository.updateLastUsed(mockApiKey.id, now);

      expect(result).toBe(false);
    });
  });
});
