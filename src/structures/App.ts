import cron from 'node-cron';
import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import { Config, isZapierPayload, ZapierPayload } from '../types';
import LINEAPIClient from './LINEAPIClient';
import YouTubeAPIClient from './YouTubeAPIClient';

export default class App {
  private readonly config: Config;

  private lineClient?: LINEAPIClient;

  private youtubeClient?: YouTubeAPIClient;

  private webServer?: Server;

  private postCounter: number;

  constructor(config: Config) {
    this.config = config;
    this.postCounter = 0;
  }

  private static getDifferenceAdverb(
    difference: number,
    additionalText?: string,
  ) {
    let result = `${
      typeof additionalText !== 'undefined' ? additionalText : ''
    }`;

    if (difference === 0) {
      result += '丁度';
    }

    if (difference < 0) {
      result += '早く';
    }

    result += '遅く';

    return result;
  }

  private async sendPostedMessage(payload: ZapierPayload) {
    const [hours, minutes] = this.config.postTime.split(':');
    const exceptedPostTime = new Date();
    exceptedPostTime.setHours(parseInt(hours, 10));
    exceptedPostTime.setMinutes(parseInt(minutes, 10));
    exceptedPostTime.setSeconds(0);

    const actualPostedDate = new Date(payload.publishedDate);

    const difference = actualPostedDate.getTime() - exceptedPostTime.getTime();

    if (this.postCounter > 0) {
      await this.lineClient?.broadcastTextMessages([
        {
          type: 'text',
          text: `新しい動画が投稿されました。\n${payload.title}\nこれは今日で ${
            this.postCounter + 1
          }回目の投稿のため、時差計算はされません。\n${payload.playURL}`,
        },
      ]);
    } else {
      const differenceSeconds = Math.floor(difference / 1000);
      const absoluteDifferenceSeconds = Math.abs(differenceSeconds);

      const differenceText = `${Math.floor(
        absoluteDifferenceSeconds / 3600,
      )}時間${Math.floor(
        (absoluteDifferenceSeconds % 1000) / 60,
      )}分${Math.floor(absoluteDifferenceSeconds % 60)}秒で`;

      await this.lineClient?.broadcastTextMessages([
        {
          type: 'text',
          text: `新しい動画が投稿されました!\n${
            payload.title
          }\n${App.getDifferenceAdverb(
            difference,
            differenceText,
          )}投稿されました。 \n${payload.playURL}`,
        },
      ]);
    }

    this.postCounter += 1;
  }

  private getExpressServer(): express.Express {
    return express()
      .use(bodyParser.urlencoded({ extended: true }))
      .use(bodyParser.json())
      .get('/', (_req, res) => {
        res.send('Hello! This is bakana-hayasugiru API.');
      })
      .get('/v1', (_req, res) => {
        res.send('Hello! This is bakana-hayasugiru API v1.');
      })
      .post('/v1/notify', async (req, res) => {
        const apiKey = req.header('X-Api-Key');

        if (typeof apiKey === 'undefined') {
          res.status(401);
          res.json({
            ok: false,
            reason: 'The X-Api-Key header has not been specified.',
          });

          return;
        }

        if (apiKey !== this.config.apiKey) {
          res.status(401);
          res.json({
            ok: false,
            reason: 'The API key is incorrect.',
          });

          return;
        }

        const payload = req.body;

        if (!isZapierPayload(payload)) {
          res.status(400).json({
            ok: false,
            reason: 'The request body is not in the correct format.',
          });

          return;
        }

        this.youtubeClient
          ?.isLiveStreaming(payload.videoId)
          .then(async (isStream) => {
            if (
              !(
                payload.title.includes('#shorts') ||
                payload.title.includes('#Shorts') ||
                payload.description.includes('#shorts') ||
                payload.description.includes('#Shorts') ||
                isStream
              )
            ) {
              await this.sendPostedMessage(payload);
            }

            res.json({ ok: true });
          })
          .catch(() => {
            res.status(500).json({
              ok: false,
            });
          });
      });
  }

  shutdown() {
    console.log('Shutdowning...');

    // Stop all schedules of cron
    cron.getTasks().forEach((task) => {
      task.stop();
    });

    // Close server
    this.webServer?.close();
  }

  start() {
    this.lineClient = new LINEAPIClient(this.config.lineChannelAccessToken);
    this.youtubeClient = new YouTubeAPIClient(this.config.youTubeAPIKey);
    const webServer = this.getExpressServer();
    const [hours, minutes] = this.config.postTime.split(':');

    cron.schedule(
      `0 ${minutes} ${hours} * * *`,
      () => {
        this.lineClient?.broadcastTextMessages([
          {
            type: 'text',
            text: `定時 (${hours}:${minutes}) になりました。`,
          },
        ]);
      },
      {
        timezone: this.config.timezone,
      },
    );

    cron.schedule(
      `0 0 0 * * *`,
      () => {
        this.postCounter = 0;
      },
      {
        timezone: this.config.timezone,
      },
    );

    const port = process.env.PORT || 3000;

    this.webServer = webServer.listen(port, () => {
      console.log(`Server is listening on ${port}`);

      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
    });
  }
}
