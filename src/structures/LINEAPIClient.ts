import ky from "ky";
import { TextMessage } from "../types.ts";

/**
 * LINE Messaging API client
 */
export class LINEAPIClient {
  private client: ReturnType<typeof ky.create>;

  /**
   * @param accessToken Channel access token
   */
  constructor(accessToken: string) {
    this.client = ky.create({
      prefixUrl: "https://api.line.me/v2",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
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
    await this.client.post("bot/message/broadcast", {
      json: {
        messages,
      },
    });
  }
}
