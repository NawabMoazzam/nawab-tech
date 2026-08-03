"use server";

import { connectDB } from "@/lib/db";
import Enquiry from "@/models/enquiry";
import { enquirySchema, type EnquiryInput } from "@/schemas/enquiry";
import { resend } from "@/lib/resend";

import ClientConfirmation from "@/app/emails/client-confirmation";
import NewEnquiry from "@/app/emails/new-enquiry";

type CreateEnquiryResult =
  | {
      success: true;
    }
  | {
      success: false;
      errors: {
        root?: string[];
      } & Record<string, string[] | undefined>;
    };

export async function createEnquiry(
  data: EnquiryInput,
): Promise<CreateEnquiryResult> {
  const parsed = enquirySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await connectDB();

    await Enquiry.create(parsed.data);

    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.NEXT_PUBLIC_CONTACT_EMAIL!,
      subject: "New Project Enquiry",
      react: NewEnquiry(parsed.data),
    });

    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: parsed.data.email,
      subject: "We've received your enquiry",
      react: ClientConfirmation({
        name: parsed.data.name,
      }),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("createEnquiry failed:", error);

    const rootError =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return {
      success: false,
      errors: {
        root:
          process.env.NODE_ENV === "production"
            ? ["Something went wrong. Please try again later."]
            : [rootError],
      },
    };
  }
}
