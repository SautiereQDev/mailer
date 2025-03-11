import jetEnv, { num } from 'jet-env';
import { isEnumVal } from 'jet-validators';

export enum NodeEnvs {
  Dev = 'development',
  Production = 'production',
}
/******************************************************************************
                                 Setup
 ******************************************************************************/

const ENV = jetEnv({
  NodeEnv: isEnumVal(NodeEnvs),
  Port: num,
  EMAIL_PASSWORD: String,
});

/******************************************************************************
                            Export default
 ******************************************************************************/

export default ENV;
