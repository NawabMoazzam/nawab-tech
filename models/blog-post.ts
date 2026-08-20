import { Schema, model, models } from "mongoose";

const blogPostSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      name: { type: String, default: "Nawab Tech" },
      role: { type: String, default: "Web Development & Digital Products" },
    },
    coverImage: {
      type: String,
      default: "",
      required: false,
    },
    coverImageFileId: {
      type: String,
      default: "",
      required: false,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    readingTime: {
      type: Number,
      default: 5,
    },
    views: {
      type: Number,
      default: 0,
    },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: { type: [String], default: [] },
      ogImage: { type: String, default: "" },
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

blogPostSchema.pre("save", function () {
  if (this.isModified("content")) {
    const words = String(this.content || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    this.readingTime = Math.max(1, Math.ceil(words / 200));
  }

  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  if (!this.seo) {
    this.seo = { keywords: [], ogImage: "" };
  }

  if (!this.seo.title) {
    this.seo.title = `${this.title} | Nawab Tech`;
  }

  if (!this.seo.description) {
    this.seo.description = this.excerpt;
  }
});

blogPostSchema.index({ title: "text", excerpt: "text", tags: "text" });

export default models.BlogPost || model("BlogPost", blogPostSchema);
