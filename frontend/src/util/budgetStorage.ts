// Utility for managing client-side budget allocations and recurring expenses scoped to logged-in user

export interface CategoryBudget {
  categoryId: string | number;
  categoryName: string;
  budgetAmount: number;
}

export interface BudgetConfig {
  monthlyBudget: number;
  categoryBudgets: CategoryBudget[];
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  categoryId: string | number;
  categoryName: string;
  frequency: "weekly" | "monthly" | "yearly";
  nextDueDate: string;
}

const getBudgetStorageKey = (userId?: string | number | null) => {
  return `em_budget_config_${userId || "default"}`;
};

const getRecurringStorageKey = (userId?: string | number | null) => {
  return `em_recurring_expenses_${userId || "default"}`;
};

export const getBudgetConfig = (userId?: string | number | null): BudgetConfig => {
  try {
    const raw = localStorage.getItem(getBudgetStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading budget config", e);
  }
  return {
    monthlyBudget: 0,
    categoryBudgets: [],
  };
};

export const saveBudgetConfig = (config: BudgetConfig, userId?: string | number | null): void => {
  try {
    localStorage.setItem(getBudgetStorageKey(userId), JSON.stringify(config));
  } catch (e) {
    console.error("Error saving budget config", e);
  }
};

export const getRecurringExpenses = (userId?: string | number | null): RecurringExpense[] => {
  try {
    const raw = localStorage.getItem(getRecurringStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading recurring expenses", e);
  }
  return [];
};

export const saveRecurringExpenses = (
  expenses: RecurringExpense[],
  userId?: string | number | null
): void => {
  try {
    localStorage.setItem(getRecurringStorageKey(userId), JSON.stringify(expenses));
  } catch (e) {
    console.error("Error saving recurring expenses", e);
  }
};
