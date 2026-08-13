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
      required: true, // Markdown content
    },
    category: {
      name: { type: String, required: true, trim: true },
      slug: { type: String, required: true, lowercase: true, trim: true, index: true },
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
      type: String, // ImageKit URL
      default: "",
    },
    coverImageFileId: {
      type: String, // ImageKit fileId for deletion
      default: "",
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
  {
    timestamps: true,
  }
);

// Auto-calculate reading time and set publishedAt if publishing first time
blogPostSchema.pre("save", function () {
  if (this.isModified("content")) {
    const words = (this as any).content.split(/\s+/).length;
    (this as any).readingTime = Math.max(1, Math.ceil(words / 200));
  }
  if (this.isModified("status") && (this as any).status === "published" && !(this as any).publishedAt) {
    (this as any).publishedAt = new Date();
  }
  // auto-generate seo if missing
  if (!(this as any).seo?.title) {
    (this as any).seo = (this as any).seo || ({} as any);
    (this as any).seo.title = `${(this as any).title} | Nawab Tech`;
  }
  if (!(this as any).seo?.description) {
    (this as any).seo = (this as any).seo || ({} as any);
    (this as any).seo.description = (this as any).excerpt;
  }
});

blogPostSchema.index({ title: "text", excerpt: "text", tags: "text" });

export default models.BlogPost || model("BlogPost", blogPostSchema);
