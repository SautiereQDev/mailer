import { IApiKey } from '../models/ApiKey';

/**
 * Interface for API Key Repository
 */
export interface IApiKeyRepository {
  /**
   * Creates a new API key in the database
   * @param {IApiKey} apiKey - The API key object to create
   * @returns {Promise<void>}
   */
  create(apiKey: IApiKey): Promise<void>;

  /**
   * Finds an API key by its ID
   * @param {string} id - The ID of the API key
   * @returns {Promise<IApiKey | null>} - The found API key or null if not found
   */
  findById(id: string): Promise<IApiKey | null>;

  /**
   * Finds all API keys by the owner's ID
   * @param {string} ownerId - The ID of the owner
   * @returns {Promise<IApiKey[]>} - An array of API keys
   */
  findByOwnerId(ownerId: string): Promise<IApiKey[]>;

  /**
   * Finds an API key by its hashed key
   * @param {string} hashedKey - The hashed key of the API key
   * @returns {Promise<IApiKey | null>} - The found API key or null if not found
   */
  findByHashedKey(hashedKey: string): Promise<IApiKey | null>;

  /**
   * Updates an existing API key
   * @param {IApiKey} apiKey - The API key object to update
   * @returns {Promise<boolean>} - True if the update was successful, false otherwise
   */
  update(apiKey: IApiKey): Promise<boolean>;

  /**
   * Updates the last used date of an API key
   * @param {string} id - The ID of the API key
   * @param {Date} lastUsedAt - The new last used date
   * @returns {Promise<boolean>} - True if the update was successful, false otherwise
   */
  updateLastUsed(id: string, lastUsedAt: Date): Promise<boolean>;

  /**
   * Deletes an API key by its ID
   * @param {string} id - The ID of the API key
   * @returns {Promise<boolean>} - True if the deletion was successful, false otherwise
   */
  delete(id: string): Promise<boolean>;
}
