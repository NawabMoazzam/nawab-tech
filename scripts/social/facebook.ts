const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v26.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function requiredMetaConfig() {
  const pageId = process.env.META_PAGE_ID?.trim();
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  if (!pageId || !accessToken) {
    throw new Error(
      "Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN GitHub Actions secret.",
    );
  }
  return { pageId, accessToken };
}

async function parseGraphResponse(response: Response) {
  const body = (await response.json()) as {
    id?: string;
    post_id?: string;
    success?: boolean;
    error?: { message?: string; type?: string; code?: number; error_subcode?: number };
    [key: string]: unknown;
  };
  if (!response.ok || body.error) {
    throw new Error(
      `Meta Graph API failed (HTTP ${response.status}): ${body.error?.message || JSON.stringify(body)}`,
    );
  }
  return body;
}

export async function publishLinkToFacebook(input: {
  message: string;
  link: string;
}): Promise<string> {
  const { pageId, accessToken } = requiredMetaConfig();
  const body = new URLSearchParams({
    message: input.message,
    link: input.link,
    access_token: accessToken,
  });
  const response = await fetch(
    `${GRAPH_BASE}/${encodeURIComponent(pageId)}/feed`,
    { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body },
  );
  const result = await parseGraphResponse(response);
  const id = (result.id || result.post_id) as string | undefined;
  if (!id) throw new Error("Meta API returned success without a post ID.");
  return id;
}

export async function publishPhotoToFacebook(input: {
  png: Buffer;
  caption: string;
  published?: boolean;
}): Promise<string> {
  const { pageId, accessToken } = requiredMetaConfig();
  const form = new FormData();
  form.set("access_token", accessToken);
  if (input.published !== false) form.set("caption", input.caption);
  if (input.published === false) form.set("published", "false");
  form.set(
    "source",
    new Blob([new Uint8Array(input.png)], { type: "image/png" }),
    "nawab-tech-social.png",
  );

  const response = await fetch(
    `${GRAPH_BASE}/${encodeURIComponent(pageId)}/photos`,
    { method: "POST", body: form },
  );
  const result = await parseGraphResponse(response);
  const id = (input.published === false ? result.id : result.post_id || result.id) as string | undefined;
  if (!id) throw new Error("Meta API returned success without a photo/post ID.");
  return id;
}

// Backward-compatible alias used by older scripts.
export async function publishPngToFacebook(input: {
  png: Buffer;
  caption: string;
}): Promise<string> {
  return publishPhotoToFacebook({ ...input, published: true });
}

export async function publishCarouselToFacebook(input: {
  slides: Buffer[];
  caption: string;
}): Promise<string> {
  if (input.slides.length < 2 || input.slides.length > 10) {
    throw new Error("Carousel requires 2-10 slides.");
  }
  const { pageId, accessToken } = requiredMetaConfig();

  // 1) Upload each slide as an unpublished photo.
  const mediaIds: string[] = [];
  for (const png of input.slides) {
    const id = await publishPhotoToFacebook({ png, caption: "", published: false });
    mediaIds.push(id);
  }

  // 2) Create a multi-photo feed post.
  const body = new URLSearchParams();
  body.set("message", input.caption);
  body.set("access_token", accessToken);
  mediaIds.forEach((id, i) => {
    body.set(`attached_media[${i}]`, JSON.stringify({ media_fbid: id }));
  });

  const response = await fetch(
    `${GRAPH_BASE}/${encodeURIComponent(pageId)}/feed`,
    { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body },
  );
  const result = await parseGraphResponse(response);
  const postId = (result.id || result.post_id) as string | undefined;
  if (!postId) throw new Error("Meta API returned success without a carousel post ID.");
  return postId;
}

export async function publishCommentToFacebook(input: {
  postId: string;
  message: string;
}): Promise<string> {
  const { accessToken } = requiredMetaConfig();
  const body = new URLSearchParams({
    message: input.message,
    access_token: accessToken,
  });
  const response = await fetch(
    `${GRAPH_BASE}/${encodeURIComponent(input.postId)}/comments`,
    { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body },
  );
  const result = await parseGraphResponse(response);
  const id = result.id as string | undefined;
  if (!id) throw new Error("Meta API returned success without a comment ID.");
  return id;
}

export type PostInsights = {
  reach?: number;
  impressions?: number;
  reactions?: number;
  comments?: number;
  shares?: number;
};

export async function getPostInsights(postId: string): Promise<PostInsights> {
  const { accessToken } = requiredMetaConfig();
  const metrics = [
    "post_impressions_unique",
    "post_impressions",
    "post_engaged_users",
    "post_reactions_by_type_total",
  ].join(",");
  const url = `${GRAPH_BASE}/${encodeURIComponent(postId)}?fields=shares,comments.summary(true).limit(0),reactions.summary(true).limit(0),insights.metric(${metrics})&access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(url);
  const body = (await response.json()) as {
    error?: { message?: string };
    shares?: { count?: number };
    comments?: { summary?: { total_count?: number } };
    reactions?: { summary?: { total_count?: number } };
    insights?: { data?: Array<{ name: string; values?: Array<{ value?: unknown }> }> };
  };
  if (!response.ok || body.error) {
    throw new Error(
      `Meta insights failed (HTTP ${response.status}): ${body.error?.message || JSON.stringify(body)}`,
    );
  }

  const insights: PostInsights = {};
  const shares = body.shares?.count;
  if (typeof shares === "number") insights.shares = shares;
  const comments = body.comments?.summary?.total_count;
  if (typeof comments === "number") insights.comments = comments;
  const reactions = body.reactions?.summary?.total_count;
  if (typeof reactions === "number") insights.reactions = reactions;

  const insightData = body.insights?.data || [];
  for (const item of insightData) {
    const value = item.values?.[0]?.value;
    if (item.name === "post_impressions_unique" && typeof value === "number") {
      insights.reach = value;
    }
    if (item.name === "post_impressions" && typeof value === "number") {
      insights.impressions = value;
    }
  }

  return insights;
}

export async function publishReelToFacebook(input: {
  video: Buffer;
  description: string;
}): Promise<string> {
  const { pageId, accessToken } = requiredMetaConfig();
  // Reels publishing uses the video endpoint. Keep behind ENABLE_REELS flag in caller.
  // Step 1: start upload session
  const startBody = new URLSearchParams({
    upload_phase: "start",
    access_token: accessToken,
  });
  const startRes = await fetch(`${GRAPH_BASE}/${encodeURIComponent(pageId)}/video_reels`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: startBody,
  });
  const start = await parseGraphResponse(startRes);
  const videoId = start.video_id as string | undefined;
  const uploadUrl = start.upload_url as string | undefined;
  if (!videoId || !uploadUrl) throw new Error("Reels start phase did not return video_id/upload_url.");

  // Step 2: upload binary
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${accessToken}`,
      offset: "0",
      file_size: String(input.video.length),
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(input.video),
  });
  if (!uploadRes.ok) {
    const t = await uploadRes.text();
    throw new Error(`Reels upload failed (HTTP ${uploadRes.status}): ${t}`);
  }

  // Step 3: publish
  const finishBody = new URLSearchParams({
    upload_phase: "finish",
    video_id: videoId,
    video_state: "PUBLISHED",
    description: input.description,
    access_token: accessToken,
  });
  const finishRes = await fetch(`${GRAPH_BASE}/${encodeURIComponent(pageId)}/video_reels`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: finishBody,
  });
  const finish = await parseGraphResponse(finishRes);
  if (!finish.success && !finish.id) {
    throw new Error("Reels finish phase did not confirm success.");
  }
  return videoId;
}
