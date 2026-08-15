import { Resend } from "resend";

// Resend validates the key in its constructor. A non-secret placeholder keeps
// build-time module evaluation working; runtime email flows still validate the
// real environment variable before sending.
export const resend = new Resend(
  process.env.RESEND_API_KEY || "re_build_placeholder_not_for_sending",
);
