import "server-only";

import { connectDB } from "@/lib/db";
import Testimonial from "@/models/testimonial";

export type TestimonialDTO = {
  _id: string;
  name: string;
  role: string;
  testimonial: string;
  avatar: string;
  avatarFileId: string;
  published: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

type TestimonialRecord = {
  _id: { toString(): string };
  name: string;
  role?: string | null;
  testimonial: string;
  avatar: string;
  avatarFileId: string;
  published?: boolean;
  order?: number;
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
};

export function toTestimonialDTO(value: unknown): TestimonialDTO {
  const testimonial = value as TestimonialRecord;

  return {
    _id: testimonial._id.toString(),
    name: testimonial.name,
    role: testimonial.role || "",
    testimonial: testimonial.testimonial,
    avatar: testimonial.avatar,
    avatarFileId: testimonial.avatarFileId,
    published: testimonial.published !== false,
    order: testimonial.order || 0,
    ...(testimonial.createdAt
      ? { createdAt: new Date(testimonial.createdAt).toISOString() }
      : {}),
    ...(testimonial.updatedAt
      ? { updatedAt: new Date(testimonial.updatedAt).toISOString() }
      : {}),
  };
}

export async function getPublishedTestimonials(): Promise<TestimonialDTO[]> {
  if (!process.env.MONGODB_URI) return [];

  try {
    await connectDB();
    const testimonials = await Testimonial.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return testimonials.map(toTestimonialDTO);
  } catch (error) {
    console.warn("Failed to fetch testimonials:", error);
    return [];
  }
}

export async function getAllTestimonials(): Promise<TestimonialDTO[]> {
  await connectDB();
  const testimonials = await Testimonial.find()
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return testimonials.map(toTestimonialDTO);
}
