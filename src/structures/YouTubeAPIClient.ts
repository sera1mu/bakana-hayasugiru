import axios, { AxiosInstance } from 'axios';
import { isYouTubePayload, YouTubePayload } from '../types';

/**
 * YouTube Data API client
 */
export default class YouTubeAPIClient {
  private client: AxiosInstance;

  /**
   * @param apiKey API key (not OAuth2 token)
   */
  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        key: apiKey,
      },
    });
  }

  /**
   * Get video data (snippet,liveStreamingDetails)
   */
  async getVideo(videoId: string): Promise<YouTubePayload> {
    const details = await this.client
      .get('/videos', {
        params: {
          part: 'snippet,liveStreamingDetails',
          id: videoId,
          maxResults: '1',
        },
      })
      .catch((err) => {
        throw new Error(`Failed to get video data: ${err}`);
      });

    if (!isYouTubePayload(details.data)) {
      throw new TypeError('YouTube Payload is incorrect.');
    }

    return details.data;
  }

  /**
   * Whether the video is live streaming or its archive
   */
  async isLiveStreaming(videoId: string) {
    const payload = await this.getVideo(videoId);

    if (typeof payload.items[0].liveStreamingDetails === 'undefined') {
      return false;
    }

    return true;
  }
}
