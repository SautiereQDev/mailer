import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import env from './config';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DatabaseService {
  private static instance: Database | null = null;

  /**
   * Obtient une instance unique de connexion à la base de données (Singleton)
   */
  public static async getConnection(): Promise<Database> {
    if (!this.instance) {
      this.instance = await open({
        filename: env.DB_PATH ?? './data/apikeys.sqlite',
        driver: sqlite3.Database,
      });

      await this.initDatabase();
    }
    return this.instance;
  }

  /**
   * Initialise la structure de la base de données
   */
  private static async initDatabase(): Promise<void> {
    const db = this.instance!;

    await db.exec(`
        CREATE TABLE IF NOT EXISTS api_keys
        (
            id           TEXT PRIMARY KEY,
            name         TEXT    NOT NULL,
            hashed_key   TEXT    NOT NULL,
            created_at   TEXT    NOT NULL,
            expires_at   TEXT,
            last_used_at TEXT,
            owner_id     TEXT    NOT NULL,
            is_active    INTEGER NOT NULL DEFAULT 1
        )
    `);
  }
}
