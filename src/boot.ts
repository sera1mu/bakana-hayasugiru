import { readFileSync } from 'fs';
import App from './structures/App';
import { Config, isConfig } from './types';
import loggers from './structures/log4js';

const VERSION = 'v1.0.0';

/**
 * Get config from file system
 */
const getConfig = function getConfigFromFileSystem(path: string): Config {
  const rawConfig = readFileSync(path, { encoding: 'utf-8' });
  const parsedConfig = JSON.parse(rawConfig);

  if (!isConfig(parsedConfig)) {
    throw new TypeError('Config syntax is invalid.');
  }

  return parsedConfig;
};

const boot = function bootServer() {
  loggers.default.info(`bakana-hayasugiru ${VERSION} (c) 2022 Seraimu.`);
  loggers.default.info(`Loading files...`);

  const configPath = process.argv[2];
  const config = getConfig(configPath);

  const app = new App(config);

  app.start();
};

boot();
