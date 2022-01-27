import cron from 'node-cron';
import express from 'express';
import bodyParser from 'body-parser';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Server } from 'http';
import { Logger } from 'log4js';
import loggers from './log4js';
import { Config, isZapierPayload, VideoItem } from '../types';
import LINEAPIClient from './LINEAPIClient';
import YouTubeAPIClient from './YouTubeAPIClient';

dayjs.extend(utc);
dayjs.extend(timezone);

export default class App {
  private readonly config: Config;

  private readonly logger: Logger;

  private lineClient?: LINEAPIClient;

  private youtubeClient?: YouTubeAPIClient;

  private webServer?: Server;

  private postCounter: number;

  constructor(config: Config) {
    this.config = config;
    this.logger = loggers.application;
    this.postCounter = 0;
  }

  private static generateDifferenceText(
    excepted: dayjs.Dayjs,
    actual: dayjs.Dayjs,
  ) {
    const diff = excepted.diff(actual, 'seconds');
    const diffInUnits = {
      hours: Math.floor(diff / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
    const baseText = `${diffInUnits.hours}時間${diffInUnits.minutes}分${diffInUnits.seconds}秒`;

    if (excepted.isSame(actual, 'seconds')) {
      return `丁度`;
    }

    if (excepted.isAfter(actual, 'seconds')) {
      return `${baseText}早く`;
    }

    return `${baseText}遅く`;
  }

  private async sendPostedMessage(item: VideoItem) {
    const [hours, minutes] = this.config.postTime.split(':');
    const exceptedPostTime = dayjs()
      .tz(this.config.timezone)
      .set('hours', parseInt(hours, 10))
      .set('minutes', parseInt(minutes, 10))
      .set('seconds', 0);

    const actualPostedDate = dayjs(item.snippet?.publishedAt).tz(
      this.config.timezone,
    );

    if (this.postCounter > 0) {
      await this.lineClient?.broadcastTextMessages([
        {
          type: 'text',
          text: `新しい動画が投稿されました。\n${
            item.snippet?.title
          }\nこれは今日で ${
            this.postCounter + 1
          }回目の投稿のため、時差計算はされません。\nhttps://youtube.com/watch?v=${
            item.id
          }`,
        },
      ]);
    } else {
      await this.lineClient?.broadcastTextMessages([
        {
          type: 'text',
          text: `新しい動画が投稿されました!\n${
            item.snippet?.title
          }\n${App.generateDifferenceText(
            exceptedPostTime,
            actualPostedDate,
          )}投稿されました。\nhttps://youtube.com/watch?v=${item.id}`,
        },
      ]);
    }

    this.postCounter += 1;
  }

  private getExpressServer(): express.Express {
    return express()
      .use(loggers.express)
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
          res.status(401).json({
            ok: false,
            reason: 'The X-Api-Key header has not been specified.',
          });

          return;
        }

        if (apiKey !== this.config.apiKey) {
          res.status(401).json({
            ok: false,
            reason: 'The API key is incorrect.',
          });

          return;
        }

        const { body } = req;

        if (!isZapierPayload(body)) {
          res.status(400).json({
            ok: false,
            reason: 'The request body is not in the correct format.',
          });

          return;
        }

        this.youtubeClient
          ?.getVideo(body.videoId)
          .then(async (payload) => {
            const item = payload.items[0];
            if (
              !(
                item.snippet?.title.includes('#shorts') ||
                item.snippet?.title.includes('#Shorts') ||
                item.snippet?.description.includes('#shorts') ||
                item.snippet?.description.includes('#Shorts') ||
                typeof payload.items[0].liveStreamingDetails !== 'undefined'
              )
            ) {
              await this.sendPostedMessage(payload.items[0]);
            }

            res.json({ ok: true });
          })
          .catch((err) => {
            res.status(500).json({
              ok: false,
            });

            this.logger.error(
              `Failed to check live streaming from YouTube API.`,
              err,
            );
          });
      });
  }

  shutdown() {
    this.logger.info('Shutdowning...');

    // Stop all schedules of cron
    cron.getTasks().forEach((task) => {
      task.stop();
    });

    this.logger.info('Stopped all scheduled tasks.');

    // Close server
    this.webServer?.close();

    this.logger.info('Closed web server.');
  }

  start() {
    this.logger.info('Starting server...');

    // Initialize clients
    this.lineClient = new LINEAPIClient(this.config.lineChannelAccessToken);
    this.youtubeClient = new YouTubeAPIClient(this.config.youTubeAPIKey);

    const webServer = this.getExpressServer();

    // Register schedules
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

    this.logger.info('Registered schedule tasks.');

    const port = process.env.PORT || 3000;

    this.webServer = webServer.listen(port, () => {
      this.logger.info(`Server is listening on ${port}!`);

      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
    });
  }
}
