import apiClient from "./axios";
import { CategoryDTO } from "../types";

export interface CreateCategoryPayload {
  name: string;
  icon?: string;
  type: "income" | "expense";
}

export const categoryApi = {
  getAllCategories: async (): Promise<CategoryDTO[]> => {
    const response = await apiClient.get<CategoryDTO[]>("/categories");
    return response.data;
  },

  getCategoriesByType: async (type: "income" | "expense"): Promise<CategoryDTO[]> => {
    const response = await apiClient.get<CategoryDTO[]>(`/categories/${type}`);
    return response.data;
  },

  addCategory: async (payload: CreateCategoryPayload): Promise<CategoryDTO> => {
    const response = await apiClient.post<CategoryDTO>("/categories", payload);
    return response.data;
  },

  updateCategory: async (
    categoryId: number | string,
    payload: CreateCategoryPayload
  ): Promise<CategoryDTO> => {
    const response = await apiClient.put<CategoryDTO>(`/categories/${categoryId}`, payload);
    return response.data;
  },
};
