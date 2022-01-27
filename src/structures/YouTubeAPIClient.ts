import axios, { AxiosInstance } from 'axios';
import { isYouTubePayload } from '../types';

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
   * Whether the video is live streaming or its archive
   */
  async isLiveStreaming(videoId: string) {
    const details = await this.client
      .get('/videos', {
        params: {
          part: 'liveStreamingDetails',
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

    if (typeof details.data.items[0].liveStreamingDetails === 'undefined') {
      return false;
    }

    return true;
  }
}
