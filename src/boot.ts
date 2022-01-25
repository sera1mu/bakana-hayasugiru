import { App } from "./structures/App.ts";
import { getConfig } from "./util/config.ts";

const boot = async function bootServer() {
  const configPath = Deno.args[0];
  const config = await getConfig(configPath);

  const app = new App(config);

  app.start();
};

await boot();
