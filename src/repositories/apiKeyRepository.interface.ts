import { IApiKey } from '../models/ApiKey';

/**
 * Interface for repository handling API key operations
 */
export interface IApiKeyRepository {
  /**
   * Create a new API key entry
   */
  create(apiKey: IApiKey): Promise<boolean>;

  /**
   * Update an existing API key
   */
  update(apiKey: IApiKey): Promise<boolean>;

  /**
   * Find API key by its ID
   */
  findById(id: string): Promise<IApiKey | null>;

  /**
   * Find API key by its hashed value
   */
  findByHashedKey(hashedKey: string): Promise<IApiKey | null>;

  /**
   * Find all API keys for a specific owner
   */
  findByOwnerId(ownerId: string): Promise<IApiKey[]>;

  /**
   * Update the lastUsedAt timestamp for an API key
   */
  updateLastUsed(id: string, lastUsedAt: Date): Promise<boolean>;
}
