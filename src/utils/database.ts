import {prisma} from '../config/prisma';
import logger from 'jet-logger';

/**
 * Vérifie la connexion à la base de données
 * @returns Promise résolvant à true si la connexion est établie, false sinon
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();

    // Exécuter une requête simple pour vérifier que la connexion fonctionne
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.err('Erreur de connexion à la base de données:' + error);
    return false;
  } finally {
    // Déconnexion après le test de connexion
    await prisma.$disconnect();
  }
}
