import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),

  email: z.string().trim().email("Please enter a valid email address."),

  company: z.string().trim().optional(),

  service: z.enum(
    [
      "business-websites",
      "custom-web-applications",
      "dashboard-development",
      "automation-integrations",
      "not-sure",
    ],
    {
      message: "Please select a service.",
    },
  ),

  budget: z.string().optional(),

  timeline: z.string().optional(),

  project: z
    .string()
    .trim()
    .min(20, "Please provide a little more detail.")
    .max(5000),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
