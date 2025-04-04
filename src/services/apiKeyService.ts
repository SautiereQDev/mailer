import crypto from 'crypto';
import { ApiKeyService as ApiKeyUtils, IApiKey } from '../models/ApiKey';
import { ApiKeyRepository } from '../repositories/apiKeyRepository';
import { IApiKeyRepository } from '@src/repositories/IApiKeyRepository';

/**
 * Service for managing API keys
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ApiKeyService {
  private static repository: IApiKeyRepository = new ApiKeyRepository();

  /**
   * Allows injecting a different repository (useful for testing)
   * @param repository - The repository to set.
   */
  public static setRepository(repository: IApiKeyRepository): void {
    this.repository = repository;
  }

  /**
   * Creates a new API key
   * @param {string} name - The name of the API key
   * @param {string} ownerId - The ID of the owner
   * @param {number} [expiresInDays] - Optional amount days until the key expires
   * @returns {Promise<string>} - The raw API key.
   */
  public static async createApiKey(
    name: string,
    ownerId: string,
    expiresInDays?: number
  ): Promise<string> {
    const { rawKey, hashedKey } = ApiKeyUtils.generateApiKey();

    const newApiKey: IApiKey = {
      id: crypto.randomUUID(),
      name,
      key: rawKey.substring(0, 8) + '...', // A truncated version for display
      hashedKey,
      createdAt: new Date(),
      ownerId,
      isActive: true,
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null,
      lastUsedAt: null,
    };

    await this.repository.create(newApiKey);
    return rawKey; // Returned only once at creation
  }

  /**
   * Validates an API key
   * @param {string} apiKey - The API key to validate
   * @returns {Promise<boolean>} - True if the key is valid, false otherwise.
   */
  public static async validateApiKey(apiKey: string): Promise<boolean> {
    const now = new Date();

    // Compute the hash of the key for lookup
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Lookup by hash
    const key = await this.repository.findByHashedKey(hashedKey);

    if (!key?.isActive) return false;
    if (key.expiresAt && key.expiresAt < now) return false;

    // Update the last used date
    await this.repository.updateLastUsed(key.id, now);
    return true;
  }

  /**
   * Revokes an API key by its ID
   * @param {string} id - The ID of the API key to revoke
   * @returns {Promise<boolean>} - True if the revocation was successful, false otherwise
   */
  public static async revokeApiKey(id: string): Promise<boolean> {
    const key = await this.repository.findById(id);
    if (!key) return false;

    key.isActive = false;
    return await this.repository.update(key);
  }

  /**
   * Retrieves all API keys for a user
   * @param {string} ownerId - The ID of the owner
   * @returns {Promise<IApiKey[]>} - An array of API keys
   */
  public static async getApiKeysByOwnerId(ownerId: string): Promise<IApiKey[]> {
    const apiKeys = await this.repository.findByOwnerId(ownerId);

    // Générer un affichage masqué pour la propriété 'key' à partir du hashedKey
    return apiKeys.map((apiKey) => {
      return {
        ...apiKey,
        key: apiKey.key ?? `${apiKey.hashedKey.substring(0, 8)}...`, // Utiliser la valeur existante ou générer une version tronquée
      };
    });
  }
}
