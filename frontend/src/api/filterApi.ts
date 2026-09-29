import apiClient from "./axios";
import { FilterDTO, ExpenseDTO, IncomeDTO } from "../types";

export const filterApi = {
  filterTransactions: async (filter: FilterDTO): Promise<(ExpenseDTO | IncomeDTO)[]> => {
    const payload: Record<string, any> = {
      type: filter.type,
      sortField: filter.sortField || "date",
      sortOrder: filter.sortOrder || "desc",
    };

    if (filter.startDate) payload.startDate = filter.startDate;
    if (filter.endDate) payload.endDate = filter.endDate;
    if (filter.keyword && filter.keyword.trim() !== "") {
      payload.keyword = filter.keyword.trim();
    }

    const response = await apiClient.post<(ExpenseDTO | IncomeDTO)[]>("/filter", payload);
    return response.data;
  },
};
