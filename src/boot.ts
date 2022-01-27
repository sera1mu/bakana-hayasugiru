import { readFileSync } from 'fs';
import App from './structures/App';
import { Config, isConfig } from './types';

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
  const configPath = process.argv[2];
  const config = getConfig(configPath);

  const app = new App(config);

  app.start();
};

boot();
