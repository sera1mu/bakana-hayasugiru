import log4js from 'log4js';
import path from 'path/posix';

log4js.configure(path.join(process.cwd(), 'log4js.config.json'));

export default {
  access: log4js.getLogger('access'),
  application: log4js.getLogger('application'),
  default: log4js.getLogger(),
  express: log4js.connectLogger(log4js.getLogger('access'), {
    level: 'INFO',
  }),
};
