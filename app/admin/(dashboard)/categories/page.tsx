import { CategoriesManager } from "@/components/admin/categories-manager";
import { getCategoriesWithPostCounts } from "@/lib/categories";

export const metadata = {
  title: "Categories | Nawab Tech Admin",
};

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategoriesWithPostCounts>> = [];
  let initialError = "";

  try {
    categories = await getCategoriesWithPostCounts();
  } catch (error) {
    console.error("Categories page error:", error);
    initialError =
      "Categories could not be loaded. Check the database connection and try again.";
  }

  return (
    <CategoriesManager
      initialCategories={categories}
      initialError={initialError}
    />
  );
}
