export interface Config {
  apiKey: string;

  lineChannelAccessToken: string;

  postTime: string;

  timezone: string;

  youTubeAPIKey: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isConfig = function isArgConfig(arg: any): arg is Config {
  const exceptedKeys =
    '["apiKey","lineChannelAccessToken","postTime","timezone","youTubeAPIKey"]';

  const actualKeys = JSON.stringify(Object.keys(arg).sort());

  if (exceptedKeys !== actualKeys) {
    return false;
  }

  return (
    typeof arg.apiKey === 'string' &&
    typeof arg.lineChannelAccessToken === 'string' &&
    typeof arg.postTime === 'string' &&
    typeof arg.timezone === 'string' &&
    typeof arg.youTubeAPIKey === 'string'
  );
};

export interface MessageEmoji {
  index: number;

  productId: string;

  emojiId: string;
}

export interface TextMessage {
  type: 'text';

  text: string;

  emojis?: MessageEmoji[];
}

export interface ZapierPayload {
  videoId: string;
}

export const isZapierPayload = function isArgZapierPayload(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg: any,
): arg is ZapierPayload {
  const exceptedKeys = '["videoId"]';
  const actualKeys = JSON.stringify(Object.keys(arg).sort());

  if (exceptedKeys !== actualKeys) return false;

  return typeof arg.videoId === 'string';
};

export interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Record<
    string,
    {
      url: string;
      width: number;
      height: number;
    }
  >;
  channelTitle: string;
  tags: string[];
  categoryId: string;
  liveBroadcastContent: string;
  localized: {
    title: string;
    description: string;
  };
}

export const isVideoSnippet = function isArgVideoSnippet(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg: any,
): arg is VideoItem {
  const exceptedKeys =
    '["categoryId","channelId","channelTitle","description","liveBroadcastContent","localized","publishedAt","tags","thumbnails","title"]';
  const actualKeys = JSON.stringify(Object.keys(arg).sort());

  if (exceptedKeys !== actualKeys) return false;

  const exceptedThumbnailKeys = '["height","url","width"]';
  let thumbnailKeyCheckResult = true;
  Object.keys(arg.thumbnails).forEach((key) => {
    const thumbnail = arg.thumbnails[key];
    const actualThumbnailKeys = JSON.stringify(Object.keys(thumbnail).sort());
    if (actualThumbnailKeys !== exceptedThumbnailKeys) {
      thumbnailKeyCheckResult = false;
    } else {
      thumbnailKeyCheckResult =
        typeof thumbnail.url === 'string' &&
        typeof thumbnail.width === 'number' &&
        typeof thumbnail.height === 'number';
    }
  });

  if (!thumbnailKeyCheckResult) return false;

  if (!Array.isArray(arg.tags)) return false;

  let tagsValueCheckResult = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg.tags.forEach((value: any) => {
    if (typeof value !== 'string') {
      tagsValueCheckResult = false;
    }
  });

  if (!tagsValueCheckResult) return false;

  const localizedExceptedKeys = '["description","title"]';
  const localizedActualKeys = JSON.stringify(Object.keys(arg.localized).sort());

  if (localizedExceptedKeys !== localizedActualKeys) return false;

  return (
    typeof arg.publishedAt === 'string' &&
    typeof arg.channelId === 'string' &&
    typeof arg.title === 'string' &&
    typeof arg.description === 'string' &&
    typeof arg.channelTitle === 'string' &&
    typeof arg.categoryId === 'string' &&
    typeof arg.liveBroadcastContent === 'string' &&
    typeof arg.localized.description === 'string' &&
    typeof arg.localized.title === 'string'
  );
};

export interface VideoItem {
  kind: string;

  etag: string;

  id: string;

  snippet?: VideoSnippet;

  liveStreamingDetails?: {
    actualStartTime?: string;

    actualEndTime?: string;

    scheduledStartTime?: string;
  };
}

export const isVideoItem = function isArgVideoItem(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg: any,
): arg is VideoItem {
  const exceptedKeysPatterns = [
    '["etag","id","kind"]',
    '["etag","id","kind","liveStreamingDetails"]',
    '["etag","id","kind","snippet"]',
    '["etag","id","kind","liveStreamingDetails","snippet"]',
  ];
  const actualKeys = JSON.stringify(Object.keys(arg).sort());

  let patternCheckResult = false;
  exceptedKeysPatterns.forEach((pattern) => {
    if (pattern === actualKeys) {
      patternCheckResult = true;
    }
  });

  if (!patternCheckResult) return false;

  return (
    typeof arg.kind === 'string' &&
    typeof arg.etag === 'string' &&
    typeof arg.id === 'string'
  );
};

export interface YouTubePayload {
  kind: string;

  etag: string;

  items: VideoItem[];

  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export const isYouTubePayload = function isArgYouTubePayload(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg: any,
): arg is YouTubePayload {
  const exceptedKeys = '["etag","items","kind","pageInfo"]';
  const actualKeys = JSON.stringify(Object.keys(arg).sort());

  if (exceptedKeys !== actualKeys) return false;

  const exceptedPageInfoKeys = '["resultsPerPage","totalResults"]';
  const actualPageInfoKeys = JSON.stringify(Object.keys(arg.pageInfo).sort());

  if (exceptedPageInfoKeys !== actualPageInfoKeys) return false;

  let itemsCheckResult = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg.items.forEach((item: any) => {
    if (!isVideoItem(item)) {
      itemsCheckResult = false;
    }
  });

  if (!itemsCheckResult) return false;

  return (
    typeof arg.kind === 'string' &&
    typeof arg.etag === 'string' &&
    typeof arg.pageInfo.totalResults === 'number' &&
    typeof arg.pageInfo.resultsPerPage === 'number'
  );
};
