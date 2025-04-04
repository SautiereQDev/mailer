import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiKeyService } from '../src/services/apiKeyService';
import { IApiKey } from '../src/models/ApiKey';

// Mock du module ApiKey
vi.mock('../src/models/ApiKey', () => ({
  ApiKeyService: {
    generateApiKey: vi.fn().mockReturnValue({
      rawKey: 'test-raw-key-12345678',
      hashedKey: 'test-hashed-key-12345678',
    }),
  },
}));

// Mock du module crypto
vi.mock('crypto', () => ({
  default: {
    randomUUID: vi.fn().mockReturnValue('mock-uuid'),
    createHash: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        digest: vi.fn().mockReturnValue('test-hashed-key-12345678'),
      }),
    }),
  },
}));

describe('ApiKeyService', () => {
  let mockRepository: {
    create: () => Promise<any>;
    findByHashedKey: () => Promise<any>;
    updateLastUsed: () => Promise<any>;
    findById: () => Promise<any>;
    update: () => Promise<any>;
    findByOwnerId: () => Promise<any>;
  };

  beforeEach(() => {
    mockRepository = {
      create: vi.fn().mockResolvedValue(true),
      findByHashedKey: vi.fn(),
      updateLastUsed: vi.fn().mockResolvedValue(true),
      findById: vi.fn(),
      update: vi.fn().mockResolvedValue(true),
      findByOwnerId: vi.fn(),
    };

    ApiKeyService.setRepository(mockRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setRepository', () => {
    it('devrait définir le repository', async () => {
      const newMockRepo = { ...mockRepository };
      ApiKeyService.setRepository(newMockRepo);

      newMockRepo.findById = vi.fn().mockResolvedValue(null);
      await ApiKeyService.revokeApiKey('test-id');

      expect(newMockRepo.findById).toHaveBeenCalledWith('test-id');
    });
  });

  describe('createApiKey', () => {
    it("devrait créer une clé API avec date d'expiration", async () => {
      const name = 'Test API Key';
      const ownerId = 'user123';
      const expiresInDays = 30;

      const rawKey = await ApiKeyService.createApiKey(name, ownerId, expiresInDays);

      expect(rawKey).toBe('test-raw-key-12345678');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);

      const createdKey = (mockRepository.create as any).mock.calls[0][0];
      expect(createdKey.name).toBe('Test API Key');
      expect(createdKey.ownerId).toBe('user123');
      expect(createdKey.expiresAt).toBeInstanceOf(Date);
    });

    it("devrait créer une clé API sans date d'expiration", async () => {
      const rawKey = await ApiKeyService.createApiKey('Test Key', 'user456');

      expect(rawKey).toBe('test-raw-key-12345678');
      const createdKey = (mockRepository.create as any).mock.calls[0][0];
      expect(createdKey.expiresAt).toBeNull();
    });
  });

  describe('validateApiKey', () => {
    it('devrait valider une clé API active et non expirée', async () => {
      const apiKey = 'valid-api-key';
      const mockApiKey: IApiKey = {
        id: 'key123',
        name: 'Test API Key',
        key: 'valid-ap...',
        hashedKey: 'test-hashed-key-12345678',
        createdAt: new Date(),
        ownerId: 'user123',
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 86400000),
        lastUsedAt: null,
      };

      (mockRepository.findByHashedKey as any).mockResolvedValue(mockApiKey);

      const isValid = await ApiKeyService.validateApiKey(apiKey);

      expect(isValid).toBe(true);
      expect(mockRepository.updateLastUsed).toHaveBeenCalledWith('key123', expect.any(Date));
    });

    it('devrait rejeter une clé API inactive', async () => {
      const mockApiKey: IApiKey = {
        id: 'key123',
        name: 'Test API Key',
        key: 'invalid-...',
        hashedKey: 'test-hashed-key-12345678',
        createdAt: new Date(),
        ownerId: 'user123',
        isActive: false,
        expiresAt: null,
        lastUsedAt: null,
      };

      (mockRepository.findByHashedKey as any).mockResolvedValue(mockApiKey);

      expect(await ApiKeyService.validateApiKey('test')).toBe(false);
      expect(mockRepository.updateLastUsed).not.toHaveBeenCalled();
    });

    it('devrait rejeter une clé API expirée', async () => {
      const mockApiKey: IApiKey = {
        id: 'key123',
        name: 'Test API Key',
        key: 'expired-...',
        hashedKey: 'test-hashed-key-12345678',
        createdAt: new Date(),
        ownerId: 'user123',
        isActive: true,
        expiresAt: new Date(Date.now() - 1000),
        lastUsedAt: null,
      };

      (mockRepository.findByHashedKey as any).mockResolvedValue(mockApiKey);

      expect(await ApiKeyService.validateApiKey('test')).toBe(false);
    });

    it('devrait rejeter une clé API inexistante', async () => {
      (mockRepository.findByHashedKey as any).mockResolvedValue(null);
      expect(await ApiKeyService.validateApiKey('unknown')).toBe(false);
    });
  });

  describe('revokeApiKey', () => {
    it('devrait révoquer une clé API existante', async () => {
      const mockApiKey: IApiKey = {
        id: 'key123',
        name: 'Test API Key',
        key: 'test-ke...',
        hashedKey: 'test-hashed-key-12345678',
        createdAt: new Date(),
        ownerId: 'user123',
        isActive: true,
        expiresAt: null,
        lastUsedAt: null,
      };

      (mockRepository.findById as any).mockResolvedValue(mockApiKey);

      const result = await ApiKeyService.revokeApiKey('key123');

      expect(result).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        })
      );
    });

    it('devrait échouer pour une clé inexistante', async () => {
      (mockRepository.findById as any).mockResolvedValue(null);
      expect(await ApiKeyService.revokeApiKey('unknown')).toBe(false);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getApiKeysByOwnerId', () => {
    it("devrait renvoyer les clés API d'un utilisateur", async () => {
      const mockApiKeys: IApiKey[] = [
        {
          id: 'key1',
          name: 'Key 1',
          key: 'key1-ke...',
          hashedKey: 'hashed-key1',
          createdAt: new Date(),
          ownerId: 'user123',
          isActive: true,
          expiresAt: null,
          lastUsedAt: null,
        },
        {
          id: 'key2',
          name: 'Key 2',
          key: undefined,
          hashedKey: 'hashed-key2',
          createdAt: new Date(),
          ownerId: 'user123',
          isActive: false,
          expiresAt: new Date(),
          lastUsedAt: new Date(),
        },
      ];

      (mockRepository.findByOwnerId as any).mockResolvedValue(mockApiKeys);

      const result = await ApiKeyService.getApiKeysByOwnerId('user123');

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('key1-ke...');
      expect(result[1].key).toBe('hashed-k...');
    });

    it("devrait renvoyer un tableau vide si aucune clé n'est trouvée", async () => {
      (mockRepository.findByOwnerId as any).mockResolvedValue([]);
      expect(await ApiKeyService.getApiKeysByOwnerId('user999')).toEqual([]);
    });
  });
});
