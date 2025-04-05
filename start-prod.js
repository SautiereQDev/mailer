// start-prod.js (à placer à la racine de votre répertoire sur le VPS)
require('module-alias').addAliases({
  '@src': __dirname
});
require('module-alias/register');
require('./index.js');