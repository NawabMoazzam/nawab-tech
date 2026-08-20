import { TestimonialsManager } from "@/components/admin/testimonials-manager";
import { getAllTestimonials } from "@/lib/testimonials";

export const metadata = {
  title: "Testimonials | Nawab Tech Admin",
};

export default async function TestimonialsPage() {
  let testimonials: Awaited<ReturnType<typeof getAllTestimonials>> = [];
  let initialError = "";

  try {
    testimonials = await getAllTestimonials();
  } catch (error) {
    console.error("Testimonials page error:", error);
    initialError =
      "Testimonials could not be loaded. Check the database connection and try again.";
  }

  return (
    <TestimonialsManager
      initialTestimonials={testimonials}
      initialError={initialError}
    />
  );
}
