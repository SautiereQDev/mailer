import { prisma } from '@src/config/prisma';
import { IApiKey } from '../models/ApiKey';
import { IApiKeyRepository } from '@src/repositories/IApiKeyRepository';

export class ApiKeyRepository implements IApiKeyRepository {
  /**
   * Create a new API key entry
   * @param apiKey - The API key to create
   * @returns Promise resolving to true if creation was successful.
   */
  public async create(apiKey: IApiKey): Promise<boolean> {
    try {
      await prisma.apiKey.create({
        data: {
          ...apiKey,
          createdAt: new Date(),
          expiresAt: apiKey.expiresAt ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          lastUsedAt: null,
        },
      });
      return true;
    } catch (error) {
      console.error('Error creating API key:', error);
      return false;
    }
  }

  /**
   * Update an existing API key
   * @param apiKey - The API key to update
   * @returns Promise resolving to true if update was successful
   */
  public async update(apiKey: IApiKey): Promise<boolean> {
    try {
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: apiKey,
      });
      return true;
    } catch (error) {
      console.error('Error updating API key:', error);
      return false;
    }
  }

  /**
   * Find API key by its ID
   * @param id - The ID of the API key to find
   * @returns Promise resolving to the found API key or null
   */
  public async findById(id: string): Promise<IApiKey | null> {
    try {
      const apiKey = await prisma.apiKey.findUnique({
        where: { id },
      });
      return apiKey as IApiKey | null;
    } catch (error) {
      console.error('Error finding API key by ID:', error);
      return null;
    }
  }

  /**
   * Find API key by its hashed value
   * @param hashedKey - The hashed key to search for
   * @returns Promise resolving to the found API key or null
   */
  public async findByHashedKey(hashedKey: string): Promise<IApiKey | null> {
    try {
      return await prisma.apiKey.findUnique({
        where: { hashedKey },
      });
    } catch (error) {
      console.error(`Error finding API key by hashed key "${hashedKey}":`, error);
      return null;
    }
  }

  /**
   * Find all API keys for a specific owner
   * @param ownerId - The ID of the owner
   * @returns Promise resolving to an array of API keys
   */
  public async findByOwnerId(ownerId: string): Promise<IApiKey[]> {
    try {
      const apiKeys = await prisma.apiKey.findMany({
        where: { ownerId },
      });
      return apiKeys as IApiKey[];
    } catch (error) {
      console.error('Error finding API keys by owner ID:', error);
      return [];
    }
  }

  /**
   * Update the lastUsedAt timestamp for an API key
   * @param id - The ID of the API key to update
   * @param lastUsedAt - The timestamp to set
   * @returns Promise resolving to true if update was successful.
   */
  public async updateLastUsed(id: string, lastUsedAt: Date): Promise<boolean> {
    try {
      await prisma.apiKey.update({
        where: { id },
        data: { lastUsedAt },
      });
      return true;
    } catch (error) {
      console.error('Error updating API key last used timestamp:', error);
      return false;
    }
  }
}
