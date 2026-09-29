export interface ExpenseDTO {
  id?: number | string;
  name: string;
  icon?: string;
  categoryName?: string;
  categoryId?: number | string;
  amount: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeDTO {
  id?: number | string;
  name: string;
  icon?: string;
  categoryName?: string;
  categoryId?: number | string;
  amount: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryDTO {
  id?: number | string;
  profileId?: number | string;
  name: string;
  icon?: string;
  type: "income" | "expense";
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileDTO {
  id?: number | string;
  fullName: string;
  email: string;
  password?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecentTransaction {
  id: number | string;
  profileId?: number | string;
  icon?: string;
  name: string;
  amount: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  type: "income" | "expense";
}

export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  recentExpenses?: ExpenseDTO[];
  recentIncomes?: IncomeDTO[];
  recentTransactions?: RecentTransaction[];
}

export interface FilterDTO {
  type: "income" | "expense";
  startDate?: string;
  endDate?: string;
  keyword?: string;
  sortField?: "date" | "amount" | "name";
  sortOrder?: "asc" | "desc";
}

export interface AuthResponse {
  token: string;
  user: ProfileDTO;
}

export interface ApiError {
  message: string;
  status?: number;
}
