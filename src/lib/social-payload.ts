import type { VehicleInfo } from "./social-caption";

export type FeedPayload = {
  format_type: "feed";
  media_aspect_ratio: "1:1" | "4:5" | "16:9";
  media_urls: string[];
  caption: string;
  hashtags: string[];
  car_link: string;
  promo_code: string;
  post_type: "image" | "video";
};

export type ReelPayload = {
  format_type: "reel";
  media_aspect_ratio: "9:16";
  media_urls: string[];
  caption: string;
  hashtags: string[];
  car_link: string;
  promo_code: string;
  post_type: "video" | "image";
};

export type ContentPayload = FeedPayload | ReelPayload;

const PROMO_CODE = "START30";

export function buildFeedPayload(
  v: VehicleInfo,
  vehicleId: string,
  images: string[],
  caption: string,
  hashtags: string[],
  carLink: string,
): FeedPayload {
  const hasVideo = Boolean(v);
  return {
    format_type: "feed",
    media_aspect_ratio: "1:1",
    media_urls: images.slice(0, 10),
    caption,
    hashtags,
    car_link: carLink,
    promo_code: PROMO_CODE,
    post_type: hasVideo ? "image" : "image",
  };
}

export function buildReelPayload(
  images: string[],
  videoUrl: string | null,
  caption: string,
  hashtags: string[],
  carLink: string,
): ReelPayload {
  const media = videoUrl ? [videoUrl] : images.slice(0, 1);
  return {
    format_type: "reel",
    media_aspect_ratio: "9:16",
    media_urls: media,
    caption,
    hashtags,
    car_link: carLink,
    promo_code: PROMO_CODE,
    post_type: videoUrl ? "video" : "image",
  };
}
