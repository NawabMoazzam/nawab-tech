import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/auth";
import { getAllTestimonials, toTestimonialDTO } from "@/lib/testimonials";
import { validateTestimonialInput } from "@/lib/testimonial-validation";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/testimonial";

export const dynamic = "force-dynamic";

async function isAuthenticated(request: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  return Boolean(session?.user);
}

// GET /api/admin/testimonials
export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testimonials = await getAllTestimonials();
    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Get testimonials error:", error);
    return NextResponse.json(
      { error: "Failed to load testimonials." },
      { status: 500 },
    );
  }
}

// POST /api/admin/testimonials
export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = validateTestimonialInput(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();
    const testimonial = await Testimonial.create(parsed.data);

    revalidatePath("/");

    return NextResponse.json(
      { success: true, testimonial: toTestimonialDTO(testimonial) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial." },
      { status: 500 },
    );
  }
}
