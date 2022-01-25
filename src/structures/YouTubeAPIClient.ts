import ky, { HTTPError } from "ky";
import { isYouTubePayload } from "../types.ts";

/**
 * YouTube Data API client
 */
export class YouTubeAPIClient {
  private client: ReturnType<typeof ky.create>;

  /**
   * @param apiKey API key (not OAuth2 token)
   */
  constructor(apiKey: string) {
    this.client = ky.create({
      prefixUrl: "https://www.googleapis.com/youtube/v3",
      headers: {
        "Content-Type": "application/json",
      },
      searchParams: {
        key: apiKey,
      },
    });
  }

  /**
   * Whether the video is live streaming or its archive
   */
  async isLiveStreaming(videoId: string) {
    const details = await this.client.get("videos", {
      searchParams: {
        part: "liveStreamingDetails",
        id: videoId,
        maxResults: "1",
      },
    }).json()
      .catch((err) => {
        if (err instanceof HTTPError) {
          throw new Error(
            `Failed to get video data: ${err.message}`,
            { cause: err },
          );
        } else {
          throw new Error(
            `Failed to get video data: ${err}`,
            { cause: err },
          );
        }
      });

    if (!isYouTubePayload(details)) {
      throw new TypeError("YouTube Payload is incorrect.");
    }

    if (typeof details.items[0].liveStreamingDetails === "undefined") {
      return false;
    } else {
      return true;
    }
  }
}
