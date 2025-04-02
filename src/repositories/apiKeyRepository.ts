import { Database } from 'sqlite';
import { IApiKey } from '../models/ApiKey';
import { IApiKeyRepository } from './apiKeyRepository.interface';
import { DatabaseService } from '../config/database';

/**
 * Repository for managing API keys in the SQLite database
 */
export class ApiKeyRepository implements IApiKeyRepository {
  private db: Database | null = null;

  /**
   * Creates a new API key in the database
   * @param {IApiKey} apiKey - The API key object to create
   * @returns {Promise<void>}
   */
  public async create(apiKey: IApiKey): Promise<void> {
    const db = await this.getDb();
    await db.run(
      `INSERT INTO api_keys (id, name, hashed_key, created_at, expires_at,
                             last_used_at, owner_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        apiKey.id,
        apiKey.name,
        apiKey.hashedKey,
        apiKey.createdAt.toISOString(),
        apiKey.expiresAt?.toISOString() || null,
        apiKey.lastUsedAt?.toISOString() || null,
        apiKey.ownerId,
        apiKey.isActive ? 1 : 0,
      ]
    );
  }

  /**
   * Finds an API key by its ID
   * @param {string} id - The ID of the API key
   * @returns {Promise<IApiKey | null>} - The found API key or null if not found
   */
  public async findById(id: string): Promise<IApiKey | null> {
    const db = await this.getDb();
    const row = await db.get('SELECT * FROM api_keys WHERE id = ?', id);
    return row ? this.mapRowToApiKey(row) : null;
  }

  /**
   * Finds all API keys by the owner's ID
   * @param {string} ownerId - The ID of the owner
   * @returns {Promise<IApiKey[]>} - An array of API keys
   */
  public async findByOwnerId(ownerId: string): Promise<IApiKey[]> {
    const db = await this.getDb();
    const rows = await db.all('SELECT * FROM api_keys WHERE owner_id = ?', ownerId);
    return rows.map((row) => this.mapRowToApiKey(row));
  }

  /**
   * Finds an API key by its hashed key
   * @param {string} hashedKey - The hashed key of the API key
   * @returns {Promise<IApiKey | null>} - The found API key or null if not found
   */
  public async findByHashedKey(hashedKey: string): Promise<IApiKey | null> {
    const db = await this.getDb();
    const row = await db.get('SELECT * FROM api_keys WHERE hashed_key = ?', hashedKey);
    return row ? this.mapRowToApiKey(row) : null;
  }

  /**
   * Updates an existing API key
   * @param {IApiKey} apiKey - The API key object to update
   * @returns {Promise<boolean>} - True if the update was successful, false otherwise
   */
  public async update(apiKey: IApiKey): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.run(
      `UPDATE api_keys
       SET name         = ?,
           hashed_key   = ?,
           expires_at   = ?,
           last_used_at = ?,
           is_active    = ?
       WHERE id = ?`,
      [
        apiKey.name,
        apiKey.hashedKey,
        apiKey.expiresAt?.toISOString() || null,
        apiKey.lastUsedAt?.toISOString() || null,
        apiKey.isActive ? 1 : 0,
        apiKey.id,
      ]
    );
    return result.changes > 0;
  }

  /**
   * Updates the last used date of an API key
   * @param {string} id - The ID of the API key
   * @param {Date} lastUsedAt - The new last used date
   * @returns {Promise<boolean>} - True if the update was successful, false otherwise
   */
  public async updateLastUsed(id: string, lastUsedAt: Date): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.run('UPDATE api_keys SET last_used_at = ? WHERE id = ?', [
      lastUsedAt.toISOString(),
      id,
    ]);
    return result.changes > 0;
  }

  /**
   * Deletes an API key by its ID
   * @param {string} id - The ID of the API key
   * @returns {Promise<boolean>} - True if the deletion was successful, false otherwise
   */
  public async delete(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.run('DELETE FROM api_keys WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * Initializes the database connection
   * @returns {Promise<Database>} - The database connection
   * @private
   */
  private async getDb(): Promise<Database> {
    if (!this.db) {
      this.db = await DatabaseService.getConnection();
    }
    return this.db;
  }

  /**
   * Maps a database row to an IApiKey object
   * @param {any} row - The database row
   * @returns {IApiKey} - The mapped API key object
   * @private
   */
  private mapRowToApiKey(row: any): IApiKey {
    return {
      id: row.id,
      name: row.name,
      key: '', // The raw key is never stored in the database
      hashedKey: row.hashed_key,
      createdAt: new Date(row.created_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
      ownerId: row.owner_id,
      isActive: Boolean(row.is_active),
    };
  }
}