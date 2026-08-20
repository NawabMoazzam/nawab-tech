export type ValidTestimonialInput = {
  name: string;
  role: string;
  testimonial: string;
  avatar: string;
  avatarFileId: string;
  published: boolean;
  order: number;
};

type TestimonialValidationResult =
  | { success: true; data: ValidTestimonialInput }
  | { success: false; error: string };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateTestimonialInput(
  input: unknown,
): TestimonialValidationResult {
  if (!input || typeof input !== "object") {
    return { success: false, error: "Invalid testimonial data." };
  }

  const value = input as Record<string, unknown>;
  const name = text(value.name);
  const role = text(value.role);
  const testimonial = text(value.testimonial);
  const requestedAvatar = text(value.avatar);
  const avatar = requestedAvatar || "/avatar.svg";
  const avatarFileId = avatar === "/avatar.svg" ? "" : text(value.avatarFileId);
  const requestedOrder = Number(value.order ?? 0);

  if (name.length < 2) {
    return { success: false, error: "Client name is required." };
  }
  if (name.length > 100) {
    return {
      success: false,
      error: "Client name must be 100 characters or fewer.",
    };
  }
  if (role.length > 140) {
    return {
      success: false,
      error: "Client role must be 140 characters or fewer.",
    };
  }
  if (testimonial.length < 10) {
    return {
      success: false,
      error: "Testimonial must be at least 10 characters.",
    };
  }
  if (testimonial.length > 1500) {
    return {
      success: false,
      error: "Testimonial must be 1,500 characters or fewer.",
    };
  }
  if (
    avatar !== "/avatar.svg" &&
    (!avatarFileId || !isValidImageUrl(avatar))
  ) {
    return {
      success: false,
      error: "The uploaded client avatar is invalid.",
    };
  }
  if (
    !Number.isInteger(requestedOrder) ||
    requestedOrder < 0 ||
    requestedOrder > 9999
  ) {
    return {
      success: false,
      error: "Display order must be a whole number between 0 and 9999.",
    };
  }

  return {
    success: true,
    data: {
      name,
      role,
      testimonial,
      avatar,
      avatarFileId,
      published: value.published !== false,
      order: requestedOrder,
    },
  };
}
