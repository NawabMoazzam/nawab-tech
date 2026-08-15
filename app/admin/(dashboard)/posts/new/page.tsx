import { PostForm } from "@/components/admin/post-form";
import { getAllCategoriesFromDB } from "@/lib/categories";

export const metadata = {
  title: "New Post | Nawab Tech Admin",
  robots: { index: false },
};

export default async function NewPostPage() {
  const categories = await getAllCategoriesFromDB();
  return <PostForm categories={categories} />;
}
