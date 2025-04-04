import { IApiKey } from '../models/ApiKey';

/**
 * Interface définissant les opérations du repository pour les clés API
 */
export interface IApiKeyRepository {
  /**
   * Crée une nouvelle clé API
   * @param apiKey - L'objet clé API à créer
   * @returns Promise<void>
   */
  create(apiKey: IApiKey): Promise<boolean>;

  /**
   * Met à jour une clé API existante
   * @param apiKey - L'objet clé API avec les modifications
   * @returns Promise<boolean> - True si la mise à jour a réussi
   */
  update(apiKey: IApiKey): Promise<boolean>;

  /**
   * Met à jour la date de dernière utilisation d'une clé API
   * @param id - L'identifiant de la clé API
   * @param lastUsedAt - La date de dernière utilisation
   * @returns Promise<void>
   */
  updateLastUsed(id: string, lastUsedAt: Date): Promise<boolean>;

  /**
   * Recherche une clé API par son identifiant
   * @param id - L'identifiant de la clé API
   * @returns Promise<IApiKey | null> - La clé API ou null si non trouvée
   */
  findById(id: string): Promise<IApiKey | null>;

  /**
   * Recherche une clé API par sa valeur hashée
   * @param hashedKey - La valeur hashée de la clé API
   * @returns Promise<IApiKey | null> - La clé API ou null si non trouvée
   */
  findByHashedKey(hashedKey: string): Promise<IApiKey | null>;

  /**
   * Recherche toutes les clés API d'un propriétaire
   * @param ownerId - L'identifiant du propriétaire
   * @returns Promise<IApiKey[]> - Tableau des clés API
   */
  findByOwnerId(ownerId: string): Promise<IApiKey[]>;
}
