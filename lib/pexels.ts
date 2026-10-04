/** Shared types for the Pexels integration (admin picker + auto-blog script). */

/** Host Pexels serves its photos from. */
export const PEXELS_IMAGE_HOST = "images.pexels.com";

export type PexelsResult = {
  id: number;
  /** Image URL stored on the post. */
  url: string;
  /** Small image used for the picker preview. */
  thumb: string;
  photographer: string;
  page: string;
  alt: string;
};
