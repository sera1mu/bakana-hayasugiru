import { Config, isConfig } from "../types.ts";

/**
 * Get config from file system
 */
export const getConfig = async function getConfigFromFileSystem(
  path: string,
): Promise<Config> {
  const rawConfig = await Deno.readTextFile(path);
  const parsedConfig = JSON.parse(rawConfig);

  if (!isConfig(parsedConfig)) {
    throw new TypeError("Config syntax is invalid.");
  }

  return parsedConfig;
};
