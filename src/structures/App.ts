import { cron, stop } from "cron";
import { json, opine } from "opine";
import { Server } from "std/http/server";
import { Config, isZapierPayload, ZapierPayload } from "../types.ts";
import { LINEAPIClient } from "./LINEAPIClient.ts";
import { YouTubeAPIClient } from "./YouTubeAPIClient.ts";

export class App {
  private readonly config: Config;

  private lineClient?: LINEAPIClient;

  private youtubeClient?: YouTubeAPIClient;

  private webServer?: Server;

  private postCounter: number;

  constructor(config: Config) {
    this.config = config;
    this.postCounter = 0;
  }

  private async sendPostedMessage(payload: ZapierPayload) {
    const [hours, minutes] = this.config.postTime.split(":");
    const exceptedPostTime = new Date();
    exceptedPostTime.setHours(parseInt(hours));
    exceptedPostTime.setMinutes(parseInt(minutes));
    exceptedPostTime.setSeconds(0);

    const actualPostedDate = new Date(payload.publishedDate);

    const difference = actualPostedDate.getTime() - exceptedPostTime.getTime();

    if (this.postCounter > 0) {
      await this.lineClient?.broadcastTextMessages([{
        type: "text",
        text: `新しい動画が投稿されました。\n${payload.title}\nこれは今日で ${
          this.postCounter + 1
        }回目の投稿のため、時差計算はされません。\n${payload.playURL}`,
      }]);
    } else {
      const differenceSeconds = Math.floor(difference / 1000);
      const absoluteDifferenceSeconds = Math.abs(differenceSeconds);

      const differenceText = `${
        Math.floor(absoluteDifferenceSeconds / 3600)
      }時間${Math.floor((absoluteDifferenceSeconds % 1000) / 60)}分${
        Math.floor(absoluteDifferenceSeconds % 60)
      }秒`;

      await this.lineClient?.broadcastTextMessages([{
        type: "text",
        text: `新しい動画が投稿されました!\n${payload.title}\n${
          difference === 0
            ? "丁度"
            : differenceSeconds < 0
            ? `${differenceText} 早く`
            : `${differenceText} 遅く`
        }投稿されました。 \n${payload.playURL}`,
      }]);
    }

    this.postCounter += 1;
  }

  private getOpineServer() {
    return opine()
      .use(json())
      .get("/", (_req, res) => {
        res.send("Hello! This is bakana-hayasugiru API.");
      })
      .post("/notify", async (req, res) => {
        const apiKey = req.headers.get("X-Api-Key");

        if (apiKey === null) {
          res.status = 401;
          res.json({
            ok: false,
            reason: "Specify the API key in the X-Api-Key header.",
          });

          return;
        }

        if (apiKey !== this.config.apiKey) {
          res.status = 401;
          res.json({
            ok: false,
            reason: "The API key is incorrect.",
          });

          return;
        }

        const payload = req.body;

        if (!isZapierPayload(payload)) {
          res.status = 400;
          res.json({
            ok: false,
            reason: "The request body is not in the correct format.",
          });

          return;
        }

        if (
          !(payload.title.includes("#shorts") ||
            payload.title.includes("#Shorts") ||
            payload.description.includes("#shorts") ||
            payload.description.includes("#Shorts") ||
            await this.youtubeClient?.isLiveStreaming(payload.videoId))
        ) {
          await this.sendPostedMessage(payload);
        }

        res.json({ ok: true });
      });
  }

  shutdown() {
    console.log("Shutdowning...");

    // Stop all schedules of cron
    stop();

    // Close server
    this.webServer?.close();
  }

  start() {
    this.lineClient = new LINEAPIClient(this.config.lineChannelAccessToken);
    this.youtubeClient = new YouTubeAPIClient(this.config.youTubeAPIKey);
    const opineServer = this.getOpineServer();
    const [hours, minutes] = this.config.postTime.split(":");

    cron(`0 ${minutes} ${hours} * * *`, () => {
      this.lineClient?.broadcastTextMessages([{
        type: "text",
        text: `定時 (${hours}:${minutes}) になりました。`,
      }]);
    });

    cron(`0 0 0 * * *`, () => this.postCounter = 0);

    this.webServer = opineServer.listen(this.config.port, () => {
      console.log(`Server is listening on ${this.config.port}`);
    });

    Deno.addSignalListener("SIGTERM", () => this.shutdown());
    Deno.addSignalListener("SIGINT", () => this.shutdown());
  }
}
