export const mailerInfo = `
# API Mailer v1.1.0

Développée par Quentin Sautiere (contact@quentinsautiere.com)
API permettant l'envoi d'emails et la gestion des clés d'API

## Authentification

### Endpoints publics
- Header: x-api-key: <votre-clé-api>
- Query parameter: ?apiKey=<votre-clé-api>

### Endpoints administrateurs
- Header: Authorization: Bearer <votre-token-jwt>

## Routes disponibles

### Informations
GET /mailer
- Description: Informations sur l'API
- Auth: Aucune
- Réponse (200): Informations sur l'API

### Envoi d'email
POST /mailer/send
- Description: Envoyer un email de contact
- Auth: Clé API requise
- Limitation: 5 requêtes par minute
- Corps de la requête:
  * name: string (obligatoire) - Nom de l'expéditeur
  * email: string (obligatoire) - Email de l'expéditeur
  * message: string (obligatoire) - Contenu du message
  * company: string (optionnel) - Nom de l'entreprise
- Réponses:
  * 200: Message envoyé avec succès
  * 400: Données invalides
  * 401: Clé API manquante
  * 403: Clé API invalide ou expirée
  * 429: Trop de requêtes
  * 500: Erreur serveur

### Gestion des clés API

POST /mailer/api-keys
- Description: Créer une nouvelle clé API
- Auth: JWT Admin requis
- Corps de la requête:
  * name: string (obligatoire) - Nom de la clé API
  * ownerId: string (obligatoire) - Identifiant du propriétaire
  * expiresInDays: number (optionnel) - Durée de validité en jours
- Réponses:
  * 201: Clé API créée avec succès (inclut la clé générée)
  * 400: Données invalides
  * 401: Authentification requise
  * 403: Accès refusé
  * 500: Erreur serveur

DELETE /mailer/api-keys/:id
- Description: Révoquer une clé API
- Auth: JWT Admin requis
- Paramètres:
  * id: string (obligatoire) - Identifiant de la clé API
- Réponses:
  * 200: Clé API révoquée avec succès
  * 401: Authentification requise
  * 403: Accès refusé
  * 404: Clé API non trouvée
  * 500: Erreur serveur

GET /mailer/api-keys/owner/:ownerId
- Description: Récupérer les clés API d'un utilisateur
- Auth: JWT Admin requis
- Paramètres:
  * ownerId: string (obligatoire) - Identifiant du propriétaire
- Réponses:
  * 200: Liste des clés API
  * 401: Authentification requise
  * 403: Accès refusé
  * 500: Erreur serveur

## Codes d'erreur
- 400: Données invalides ou manquantes
- 401: Authentification requise ou token invalide
- 403: Permission refusée
- 404: Ressource non trouvée
- 429: Trop de requêtes dans un délai donné
- 500: Erreur serveur interne
`;
