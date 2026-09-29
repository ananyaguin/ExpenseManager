import apiClient from "./axios";
import { ExpenseDTO } from "../types";

export interface CreateExpensePayload {
  name: string;
  icon?: string;
  categoryId: number | string;
  amount: number;
  date: string;
}

export const expenseApi = {
  getExpenses: async (): Promise<ExpenseDTO[]> => {
    const response = await apiClient.get<ExpenseDTO[]>("/expenses");
    return response.data;
  },

  addExpense: async (payload: CreateExpensePayload): Promise<ExpenseDTO> => {
    const response = await apiClient.post<ExpenseDTO>("/expenses", payload);
    return response.data;
  },

  deleteExpense: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },
};
