import moduleAlias from 'module-alias';
import logger from 'jet-logger';
import env from '@src/config';

import server from './server';

moduleAlias.addAlias('@src', __dirname);

/******************************************************************************
                                  Run
******************************************************************************/

const SERVER_START_MSG = 'Express server started on port: ' + env.PORT.toString();

server.listen(env.PORT, () => logger.info(SERVER_START_MSG));
