import { connectDB } from "@/lib/db";
import BlogPost from "@/models/blog-post";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let stats = { total: 0, published: 0, drafts: 0, featured: 0 };

  try {
    await connectDB();
    const [total, published, drafts, featured] = await Promise.all([
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: "published" }),
      BlogPost.countDocuments({ status: "draft" }),
      BlogPost.countDocuments({ featured: true }),
    ]);
    stats = { total, published, drafts, featured };
  } catch (e) {
    console.warn("DB not connected for dashboard", e);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage your blog with Better Auth + ImageKit</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Published</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.published}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Drafts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{stats.drafts}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Featured</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{stats.featured}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/posts/new"><Button>New Post</Button></Link>
            <Link href="/admin/posts"><Button variant="outline">View All Posts</Button></Link>
            <Link href="/blog" target="_blank"><Button variant="outline">View Blog</Button></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Setup Checklist - Arena AI</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <p className="font-medium">1. Env vars (Vercel + local .env.local):</p>
              <code className="block bg-muted p-2 rounded text-xs overflow-auto">
                MONGODB_URI=mongodb+srv://...<br/>
                BETTER_AUTH_SECRET=openssl rand -base64 32<br/>
                BETTER_AUTH_URL=https://your-domain.vercel.app<br/>
                NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app<br/>
                IMAGEKIT_PUBLIC_KEY=public_...<br/>
                IMAGEKIT_PRIVATE_KEY=private_...<br/>
                IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id<br/>
              </code>
            </div>
            <div className="space-y-1">
              <p className="font-medium">2. ImageKit Complete Free plan:</p>
              <p className="text-muted-foreground text-xs">Go to imagekit.io → Register → Choose Media Processing + DAM → Free. Copy keys from Dashboard → Settings → API Keys + URL Endpoint.</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">3. First Admin:</p>
              <p className="text-muted-foreground text-xs">Go to /admin/login → Create account. Then in MongoDB Compass/Atlas, set that user&#39;s role to &quot;admin&quot; in the <code>user</code> collection, or run seed script.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Architecture</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>✅ Better Auth 1.3.27 (self-hosted, $0) + MongoDB Adapter (raw MongoClient from Mongoose)</p>
          <p>✅ Protected by proxy.ts (Next.js 16 edge) + server layout check (mandatory for security)</p>
          <p>✅ ImageKit Complete Free (20GB BW + 3GB storage) — server upload at /api/admin/upload + client auth at /api/imagekit/auth</p>
          <p>✅ BlogPost Mongoose model with ISR revalidation via revalidateTag(&apos;blog-posts&apos;)</p>
          <p>✅ Editor: @uiw/react-md-editor (markdown) + ImageKit button</p>
          <p className="pt-2 font-medium text-foreground">Completely free on Vercel Hobby: $0/mo</p>
        </CardContent>
      </Card>
    </div>
  );
}
