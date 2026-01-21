import { SqliteCategoryRepository } from "@/src/services/category/SqliteCategoryRepository";
import { useQuery } from "@tanstack/react-query";

const categoryRepo = new SqliteCategoryRepository();

export function useCategories(type: "income" | "expense" | "task") {
  const query = useQuery({
    queryKey: ["categories", type],
    queryFn: async () => {
      // Seed if fetching tasks
      if (type === "task") {
        await categoryRepo.seedTaskCategories();
      }
      return categoryRepo.getAllByType(type);
    },
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
