import apiClient from "./axios";
import { IncomeDTO } from "../types";

export interface CreateIncomePayload {
  name: string;
  icon?: string;
  categoryId: number | string;
  amount: number;
  date: string;
}

export const incomeApi = {
  getIncomes: async (): Promise<IncomeDTO[]> => {
    const response = await apiClient.get<IncomeDTO[]>("/incomes");
    return response.data;
  },

  addIncome: async (payload: CreateIncomePayload): Promise<IncomeDTO> => {
    const response = await apiClient.post<IncomeDTO>("/incomes", payload);
    return response.data;
  },

  deleteIncome: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/incomes/${id}`);
  },
};
