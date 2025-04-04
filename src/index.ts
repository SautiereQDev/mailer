import moduleAlias from 'module-alias';
import logger from 'jet-logger';
import env from '@src/config';
import { checkDatabaseConnection } from './utils/database';

import server from './server';

moduleAlias.addAlias('@src', __dirname);

/******************************************************************************
 Run
 ******************************************************************************/

const SERVER_START_MSG = 'Express server started on port: ' + env.PORT.toString();

async function startServer() {
  // Vérifier la connexion à la DB avant de démarrer le serveur
  const isConnected = await checkDatabaseConnection();

  if (!isConnected) {
    logger.err('Impossible de se connecter à la base de données. Arrêt du serveur.');
    throw new Error('Database connection failed');
  }

  logger.info('Connexion à la base de données établie avec succès.');

  logger.info(SERVER_START_MSG);
}

server.listen(env.PORT, startServer);
