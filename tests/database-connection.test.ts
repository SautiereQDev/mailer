import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/config/prisma';

describe('Database Connection', () => {
  beforeAll(async () => {
    // S'assurer que la connexion est établie avant les tests
    await prisma.$connect();
  });

  afterAll(async () => {
    // Fermer la connexion après les tests
    await prisma.$disconnect();
  });

  it('devrait se connecter à la base de données', async () => {
    // Exécuter une requête simple pour vérifier la connexion
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('result', 2);
  });

  it('devrait pouvoir accéder à la table apiKey', async () => {
    try {
      // Vérifier l'accès à la table en comptant les entrées
      const count = await prisma.apiKey.count();
      // On vérifie simplement que count est un nombre
      expect(typeof count).toBe('number');
    } catch (error) {
      // En cas d'erreur, le test échoue
      expect(error).toBeUndefined();
    }
  });
});
