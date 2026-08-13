import { PostForm } from "@/components/admin/post-form";

export const metadata = {
  title: "New Post | Nawab Tech Admin",
  robots: { index: false },
};

export default function NewPostPage() {
  return <PostForm />;
}
