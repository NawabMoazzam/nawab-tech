import { Schema, model, models } from "mongoose";

const enquirySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    company: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    service: {
      type: String,
      enum: [
        "business-websites",
        "custom-web-applications",
        "dashboard-development",
        "automation-integrations",
        "not-sure",
      ],
      required: true,
    },

    budget: {
      type: String,
      enum: ["under-500", "500-2000", "2000-5000", "5000-plus"],
    },

    project: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "won", "lost"],
      default: "new",
    },
    timeline: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default models.Enquiry || model("Enquiry", enquirySchema);
