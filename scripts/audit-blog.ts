import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { writeFile } from "node:fs/promises";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

type Post = {
  _id: { toString(): string };
  slug: string;
  title: string;
  focusKeyword?: string;
  seo?: { keywords?: string[] };
  tags?: string[];
  status?: string;
  noindex?: boolean;
  content?: string;
};

const tokens = (value: string) => new Set(value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 2));
const jaccard = (a: Set<string>, b: Set<string>) => {
  const union = new Set([...a, ...b]);
  return union.size ? [...a].filter((word) => b.has(word)).length / union.size : 0;
};

async function main() {
  if (!process.env.MONGODB_URI) {
    console.log("[audit-blog] MONGODB_URI is not set; no database audit was run.");
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const posts = await mongoose.connection.getClient().db().collection<Post>("blogposts")
    .find({}, { projection: { slug: 1, title: 1, focusKeyword: 1, seo: 1, tags: 1, status: 1, noindex: 1, content: 1 } })
    .sort({ createdAt: 1 }).toArray();

  const neighbors = new Map<number, Set<number>>(posts.map((_, index) => [index, new Set()]));
  for (let i = 0; i < posts.length; i += 1) {
    for (let j = i + 1; j < posts.length; j += 1) {
      const first = posts[i];
      const second = posts[j];
      const keywordA = (first.focusKeyword || first.seo?.keywords?.[0] || "").trim().toLowerCase();
      const keywordB = (second.focusKeyword || second.seo?.keywords?.[0] || "").trim().toLowerCase();
      const titleSimilarity = jaccard(tokens(first.title || ""), tokens(second.title || ""));
      const tagSimilarity = jaccard(tokens((first.tags || []).join(" ")), tokens((second.tags || []).join(" ")));
      if ((keywordA && keywordB && keywordA === keywordB) || titleSimilarity > 0.3 || tagSimilarity > 0.5) {
        neighbors.get(i)?.add(j);
        neighbors.get(j)?.add(i);
      }
    }
  }

  const visited = new Set<number>();
  const clusters: number[][] = [];
  for (let index = 0; index < posts.length; index += 1) {
    if (visited.has(index)) continue;
    const stack = [index];
    const cluster: number[] = [];
    while (stack.length) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      cluster.push(current);
      for (const neighbor of neighbors.get(current) || []) if (!visited.has(neighbor)) stack.push(neighbor);
    }
    clusters.push(cluster);
  }

  const actions = new Map<number, string>();
  for (const cluster of clusters) {
    if (cluster.length === 1) {
      actions.set(cluster[0], posts[cluster[0]].noindex ? "noindex (already marked)" : "keep");
      continue;
    }
    const ranked = [...cluster].sort((a, b) => {
      const score = (post: Post) => (post.status === "published" ? 100000 : 0) + (post.content?.length || 0);
      return score(posts[b]) - score(posts[a]);
    });
    const keeper = posts[ranked[0]];
    actions.set(ranked[0], "keep (cluster representative)");
    for (const index of ranked.slice(1)) {
      actions.set(index, `merge into /blog/${keeper.slug}; then redirect or noindex the retired URL`);
    }
  }

  const lines = [
    "# Blog content audit report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Posts reviewed: ${posts.length}`,
    `Similarity clusters: ${clusters.filter((cluster) => cluster.length > 1).length}`,
    `Potential near-duplicate posts: ${clusters.filter((cluster) => cluster.length > 1).reduce((sum, cluster) => sum + cluster.length, 0)}`,
    "",
    "> This is a read-only audit. No post data was changed. Similarity clusters are editorial review candidates, not automatic deletion/redirect decisions.",
    "",
  ];
  clusters.forEach((cluster, index) => {
    if (cluster.length > 1) {
      lines.push(`## Similarity cluster ${index + 1}`, "");
      for (const postIndex of cluster) {
        const post = posts[postIndex];
        const keyword = post.focusKeyword || post.seo?.keywords?.[0] || "(none recorded)";
        lines.push(`- **${post.title}** — /blog/${post.slug} — focus keyword: ${keyword} — status: ${post.status || "unknown"} — recommendation: ${actions.get(postIndex)}`);
      }
      lines.push("");
    }
  });
  lines.push("## Recommended action per post", "");
  posts.forEach((post, index) => lines.push(`- **${post.title}** — /blog/${post.slug} — ${actions.get(index)}`));
  lines.push("");

  await writeFile("audit-report.md", lines.join("\n"), "utf8");
  console.log(`[audit-blog] Wrote audit-report.md: ${posts.length} posts, ${clusters.filter((cluster) => cluster.length > 1).length} clusters, ${clusters.reduce((sum, cluster) => sum + (cluster.length > 1 ? cluster.length : 0), 0)} posts flagged.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("[audit-blog] Failed:", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
