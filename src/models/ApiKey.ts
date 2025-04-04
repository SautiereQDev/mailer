import crypto from 'crypto';

/**
 * Interface representing an API key entity
 */
export interface IApiKey {
  /** A unique identifier for the API key */
  id: string;
  /** Human-readable name of the API key */
  name: string;
  /** Raw API key value (not stored long-term) */
  key?: string; // Rendu optionnel car non stocké en DB
  /** Hashed representation of the API key for secure storage */
  hashedKey: string;
  /** Optional expiration date */
  expiresAt?: Date | null;
  /** Creation timestamp */
  createdAt: Date;
  /** Last usage timestamp */
  lastUsedAt?: Date | null;
  /** ID of the entity owning this key */
  ownerId: string;
  /** Whether the key can be used for authentication */
  isActive: boolean;
}

/**
 * Service for generating and validating API keys encoded in base64
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ApiKeyService {
  /**
   * Generates a new API key pair (raw and hashed versions)
   * @param {string} prefix - Optional prefix for the API key (default: 'mail')
   * @returns {Object} Object containing both versions of the key
   * @returns {string} Object.rawKey - The client-facing API key
   * @returns {string} Object.hashedKey - The hash to store in the database
   * @example
   * const { rawKey, hashedKey } = ApiKeyService.generateApiKey('customPrefix');
   * console.log(rawKey); // e.g., 'customPrefix_1234567890abcdef'
   * console.log(hashedKey); // e.g., 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2'
   */
  public static generateApiKey(prefix = 'mail'): { rawKey: string; hashedKey: string } {
    const randomString = this.generateRandomString();
    const rawKey = `${prefix}_${randomString}`;
    // Utiliser digest('hex') pour être cohérent avec le reste du code
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
    return { rawKey, hashedKey };
  }

  /**
   * Generates a cryptographically secure random string
   * @returns {string} A random string encoded in base64
   * @private
   */
  private static generateRandomString(): string {
    return crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, '');
  }
}
