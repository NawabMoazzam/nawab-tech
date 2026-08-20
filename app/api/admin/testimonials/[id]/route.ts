import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isObjectIdOrHexString } from "mongoose";

import { getAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getErrorMessage } from "@/lib/errors";
import { imagekit, isImageKitNotFoundError } from "@/lib/imagekit";
import { validateTestimonialInput } from "@/lib/testimonial-validation";
import { toTestimonialDTO } from "@/lib/testimonials";
import Testimonial from "@/models/testimonial";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function isAuthenticated(request: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  return Boolean(session?.user);
}

function invalidIdResponse() {
  return NextResponse.json(
    { error: "Invalid testimonial ID." },
    { status: 400 },
  );
}

// GET /api/admin/testimonials/:id
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) return invalidIdResponse();

    await connectDB();
    const testimonial = await Testimonial.findById(id).lean();

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ testimonial: toTestimonialDTO(testimonial) });
  } catch (error) {
    console.error("Get testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to load testimonial." },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/testimonials/:id
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) return invalidIdResponse();

    const parsed = validateTestimonialInput(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();
    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true },
    );

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found." },
        { status: 404 },
      );
    }

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      testimonial: toTestimonialDTO(testimonial),
    });
  } catch (error) {
    console.error("Update testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial." },
      { status: 500 },
    );
  }
}

export const PUT = PATCH;

// DELETE /api/admin/testimonials/:id
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) return invalidIdResponse();

    await connectDB();
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found." },
        { status: 404 },
      );
    }

    if (testimonial.avatarFileId) {
      try {
        await imagekit.deleteFile(testimonial.avatarFileId);
      } catch (error) {
        if (!isImageKitNotFoundError(error)) {
          console.error("Delete testimonial avatar error:", error);
          return NextResponse.json(
            {
              error: getErrorMessage(
                error,
                "The avatar could not be deleted from ImageKit.",
              ),
            },
            { status: 502 },
          );
        }
      }
    }

    await testimonial.deleteOne();
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial." },
      { status: 500 },
    );
  }
}
