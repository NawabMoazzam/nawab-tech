import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@/lib/auth";
import {
  getCategoriesWithPostCounts,
  toCategoryDTO,
} from "@/lib/categories";
import { validateCategoryInput } from "@/lib/category-validation";
import { connectDB } from "@/lib/db";
import { isMongoDuplicateKeyError } from "@/lib/errors";
import Category from "@/models/category";

export const dynamic = "force-dynamic";

async function isAuthenticated(request: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  return Boolean(session?.user);
}

function categoryConflictResponse() {
  return NextResponse.json(
    { error: "A category with that name or slug already exists." },
    { status: 409 },
  );
}

// GET /api/admin/categories
export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await getCategoriesWithPostCounts();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Failed to load categories." },
      { status: 500 },
    );
  }
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = validateCategoryInput(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectDB();

    const duplicate = await Category.findOne({
      $or: [{ slug: parsed.data.slug }, { name: parsed.data.name }],
    }).select("_id");

    if (duplicate) return categoryConflictResponse();

    const category = await Category.create(parsed.data);

    revalidatePath("/blog");
    revalidatePath(`/blog/category/${category.slug}`);

    return NextResponse.json(
      { success: true, category: toCategoryDTO(category) },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (isMongoDuplicateKeyError(error)) return categoryConflictResponse();

    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 },
    );
  }
}
