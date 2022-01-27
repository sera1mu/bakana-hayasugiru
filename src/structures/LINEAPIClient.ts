import axios, { AxiosInstance } from 'axios';
import { TextMessage } from '../types';

/**
 * LINE Messaging API client
 */
export default class LINEAPIClient {
  private client: AxiosInstance;

  /**
   * @param accessToken Channel access token
   */
  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://api.line.me/v2',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Send text messages to all friends
   *
   * https://developers.line.biz/ja/reference/messaging-api/#send-broadcast-message
   *
   * @param messages https://developers.line.biz/ja/reference/messaging-api/#message-objects
   */
  async broadcastTextMessages(messages: TextMessage[]) {
    await this.client.post('/bot/message/broadcast', {
      messages,
    });
  }
}
