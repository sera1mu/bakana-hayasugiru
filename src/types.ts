export interface Config {
  apiKey: string;

  lineChannelAccessToken: string;

  port: number;

  postTime: string;

  timezone: string;

  youTubeAPIKey: string;
}

// deno-lint-ignore no-explicit-any
export const isConfig = function isArgConfig(arg: any): arg is Config {
  const exceptedKeys =
    '["apiKey","lineChannelAccessToken","port","postTime","timezone","youTubeAPIKey"]';

  const actualKeys = JSON.stringify(Object.keys(arg).sort());

  if (exceptedKeys !== actualKeys) {
    return false;
  }

  return typeof arg.apiKey === "string" &&
    typeof arg.lineChannelAccessToken === "string" &&
    typeof arg.port === "number" && typeof arg.postTime === "string" &&
    typeof arg.timezone === "string" &&
    typeof arg.youTubeAPIKey === "string";
};

export interface MessageEmoji {
  index: number;

  productId: string;

  emojiId: string;
}

export interface TextMessage {
  type: "text";

  text: string;

  emojis?: MessageEmoji[];
}

export interface ZapierPayload {
  description: string;

  playURL: string;

  publishedDate: string;

  title: string;

  videoId: string;
}

export const isZapierPayload = function isArgZapierPayload(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is ZapierPayload {
  const exceptedKeys =
    '["description","playURL","publishedDate","title","videoId"]';
  const actualKeys = JSON.stringify(Object.keys(arg).sort());

  if (exceptedKeys !== actualKeys) return false;

  return typeof arg.description === "string" &&
    typeof arg.playURL === "string" &&
    typeof arg.publishedDate === "string" &&
    typeof arg.title === "string" && typeof arg.videoId === "string";
};

export interface YouTubeVideoItem {
  kind: string;

  etag: string;

  id: string;

  liveStreamingDetails?: {
    actualStartTime?: string;

    actualEndTime?: string;

    scheduledStartTime?: string;
  };
}

export const isYouTubeVideoItem = function isArgYouTubeVideoItem(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is YouTubeVideoItem {
  const exceptedKeys1 = '["etag","id","kind"]';
  const exceptedKeys2 = '["etag","id","kind","liveStreamingDetails"]';
  const actualKeys = JSON.stringify(Object.keys(arg).sort());

  if (exceptedKeys1 !== actualKeys && exceptedKeys2 !== actualKeys) {
    return false;
  }

  return typeof arg.kind === "string" && typeof arg.etag === "string" &&
    typeof arg.id === "string";
};

export interface YouTubePayload {
  kind: string;

  etag: string;

  items: YouTubeVideoItem[];

  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export const isYouTubePayload = function isArgYouTubePayload(
  // deno-lint-ignore no-explicit-any
  arg: any,
): arg is YouTubePayload {
  const exceptedKeys = '["etag","items","kind","pageInfo"]';
  const actualKeys = JSON.stringify(Object.keys(arg).sort());

  if (exceptedKeys !== actualKeys) return false;

  const exceptedPageInfoKeys = '["resultsPerPage","totalResults"]';
  const actualPageInfoKeys = JSON.stringify(Object.keys(arg.pageInfo).sort());

  if (exceptedPageInfoKeys !== actualPageInfoKeys) return false;

  for (const item of arg.items) {
    if (!isYouTubeVideoItem(item)) return false;
  }

  return typeof arg.kind === "string" && typeof arg.etag === "string" &&
    typeof arg.pageInfo.totalResults === "number" &&
    typeof arg.pageInfo.resultsPerPage === "number";
};
