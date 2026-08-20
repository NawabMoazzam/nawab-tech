import { Schema, model, models } from "mongoose";

const testimonialSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      default: "",
      trim: true,
      maxlength: 140,
    },
    testimonial: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    avatar: {
      type: String,
      default: "/avatar.svg",
      trim: true,
    },
    avatarFileId: {
      type: String,
      default: "",
      trim: true,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
      max: 9999,
      index: true,
    },
  },
  { timestamps: true },
);

export default models.Testimonial || model("Testimonial", testimonialSchema);
