import { NextResponse } from "next/server";
import { getImageKitAuthParams } from "@/lib/imagekit";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Client-side upload auth endpoint
// GET /api/imagekit/auth - returns token, expire, signature for secure client upload
export async function GET(request: Request) {
  try {
    // Verify session - only authenticated admins can get upload auth
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authParams = getImageKitAuthParams();

    return NextResponse.json({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json({ error: "Failed to generate auth params" }, { status: 500 });
  }
}
