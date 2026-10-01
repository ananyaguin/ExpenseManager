import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Target,
  AlertTriangle,
  AlertCircle,
  PieChart as PieChartIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AppLayout from "../components/layout/AppLayout";
import { dashboardApi } from "../api/dashboardApi";
import { expenseApi } from "../api/expenseApi";
import { DashboardData, RecentTransaction, ExpenseDTO } from "../types";
import { formatCurrency, formatDate, formatShortDate } from "../util/formatters";
import { CardSkeleton, ChartSkeleton, TableSkeleton } from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import CategoryIcon from "../components/common/CategoryIcon";
import { getErrorMessage } from "../api/errorUtil";
import { useAuth } from "../context/AuthContext";
import { getBudgetConfig } from "../util/budgetStorage";

const CATEGORY_COLORS = [
  "#6366f1",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || user?.email;

  const [data, setData] = useState<DashboardData | null>(null);
  const [currentExpenses, setCurrentExpenses] = useState<ExpenseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const budgetConfig = getBudgetConfig(userId);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, expRes] = await Promise.all([
        dashboardApi.getDashboardData(),
        expenseApi.getExpenses(),
      ]);
      setData(dashRes);
      setCurrentExpenses(expRes || []);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [userId]);

  // Current Month Spending
  const currentMonthSpending = currentExpenses.reduce(
    (acc, exp) => acc + Number(exp.amount || 0),
    0
  );

  // Category breakdown calculation
  const categoryMap: { [name: string]: { name: string; amount: number; icon?: string } } = {};
  currentExpenses.forEach((exp) => {
    const key = exp.categoryName || "Uncategorized";
    if (!categoryMap[key]) {
      categoryMap[key] = { name: key, amount: 0, icon: exp.icon };
    }
    categoryMap[key].amount += Number(exp.amount || 0);
  });

  const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);

  // Budget status for current month
  const monthlyBudget = budgetConfig.monthlyBudget;
  const isBudgetSet = monthlyBudget > 0;
  const budgetRatio = isBudgetSet ? (currentMonthSpending / monthlyBudget) * 100 : 0;
  const isOverBudget = isBudgetSet && currentMonthSpending > monthlyBudget;
  const isNearLimit = isBudgetSet && !isOverBudget && budgetRatio >= 80;

  // Prepare chart data from recent transactions or recent incomes/expenses
  const prepareChartData = () => {
    if (!data) return [];

    const txMap: { [date: string]: { date: string; income: number; expense: number } } = {};

    const allTx: RecentTransaction[] = data.recentTransactions || [];
    allTx.forEach((tx) => {
      const dateKey = tx.date;
      if (!txMap[dateKey]) {
        txMap[dateKey] = { date: dateKey, income: 0, expense: 0 };
      }
      if (tx.type === "income") {
        txMap[dateKey].income += Number(tx.amount || 0);
      } else {
        txMap[dateKey].expense += Number(tx.amount || 0);
      }
    });

    (data.recentIncomes || []).forEach((inc) => {
      const dateKey = inc.date;
      if (!txMap[dateKey]) {
        txMap[dateKey] = { date: dateKey, income: Number(inc.amount || 0), expense: 0 };
      }
    });

    (data.recentExpenses || []).forEach((exp) => {
      const dateKey = exp.date;
      if (!txMap[dateKey]) {
        txMap[dateKey] = { date: dateKey, income: 0, expense: Number(exp.amount || 0) };
      }
    });

    const sorted = Object.values(txMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((item) => ({
      ...item,
      displayDate: formatShortDate(item.date),
    }));
  };

  const chartData = prepareChartData();

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800">
          <p className="font-semibold text-slate-300 pb-1 border-b border-slate-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
              <span className="capitalize" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="font-bold text-white">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="space-y-7 pb-12">
        {/* Welcome Greeting Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Track your income, expenses, and cash flow balance in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/expenses"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              Manage Expenses
            </Link>
            <Link
              to="/incomes"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-colors"
            >
              Manage Income
            </Link>
          </div>
        </div>

        {/* Budget Alert Banner if Exceeded or Near Limit */}
        {isBudgetSet && (isOverBudget || isNearLimit) && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isOverBudget
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {isOverBudget ? (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold">
                  {isOverBudget ? "Monthly Budget Exceeded!" : "Budget Warning (80% Reached)"}
                </p>
                <p className="text-xs mt-0.5 opacity-90">
                  {isOverBudget
                    ? `You have spent ${formatCurrency(currentMonthSpending)}, exceeding your monthly target of ${formatCurrency(monthlyBudget)}.`
                    : `You have utilized ${Math.round(budgetRatio)}% of your monthly budget (${formatCurrency(currentMonthSpending)} / ${formatCurrency(monthlyBudget)}).`}
                </p>
              </div>
            </div>
            <Link
              to="/budgets"
              className="px-3 py-1.5 rounded-xl bg-white text-xs font-semibold shadow-2xs border border-inherit hover:bg-slate-50 transition-colors flex-shrink-0"
            >
              View Budget
            </Link>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUMMARY CARDS (4 KPI Metrics) */}
        {/* ============================================================ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Balance Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Balance
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <WalletCards className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                {formatCurrency(data?.totalBalance)}
              </div>
              <p className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                <span>Net available funds</span>
              </p>
            </div>

            {/* Total Income Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Income
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600 tracking-tight mb-1">
                {formatCurrency(data?.totalIncome)}
              </div>
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>All-time earnings</span>
              </p>
            </div>

            {/* Total Expense Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Expenses
                </span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-600 tracking-tight mb-1">
                {formatCurrency(data?.totalExpense)}
              </div>
              <p className="text-xs font-medium text-rose-700 flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>All-time spendings</span>
              </p>
            </div>

            {/* Current Month Spending Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Current Month Spending
                </span>
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                {formatCurrency(currentMonthSpending)}
              </div>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                {isBudgetSet ? (
                  <span className={isOverBudget ? "text-rose-600 font-semibold" : "text-slate-600"}>
                    {Math.round(budgetRatio)}% of monthly budget
                  </span>
                ) : (
                  <span>{currentExpenses.length} transactions this month</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CHART SECTION & EXPENSE CATEGORY BREAKDOWN */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income vs Expense Chart (2 columns) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Income vs Expense</h3>
                <p className="text-xs text-slate-500 mt-0.5">Financial activity breakdown by date</p>
              </div>
            </div>

            {loading ? (
              <ChartSkeleton />
            ) : chartData.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-400 font-medium">
                  No transaction data available to plot yet.
                </p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="displayDate"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: "14px", fontSize: "12px" }} iconType="circle" />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Expense Category Breakdown (1 column) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-slate-900">Expense Category Breakdown</h3>
                <PieChartIcon className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xs text-slate-500 mb-4">Current month spending by category</p>

              {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 bg-slate-100 rounded-xl"></div>
                  <div className="h-10 bg-slate-100 rounded-xl"></div>
                  <div className="h-10 bg-slate-100 rounded-xl"></div>
                </div>
              ) : categoryBreakdown.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No expenses recorded this month yet.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                  {categoryBreakdown.slice(0, 5).map((cat, idx) => {
                    const percentage =
                      currentMonthSpending > 0
                        ? Math.round((cat.amount / currentMonthSpending) * 100)
                        : 0;
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="font-semibold text-slate-800">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-medium">{percentage}%</span>
                            <span className="font-bold text-slate-900">
                              {formatCurrency(cat.amount)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <Link
                to="/reports"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Reports & Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RECENT TRANSACTIONS TABLE */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest account activity</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <TableSkeleton rows={4} />
          ) : !data?.recentTransactions || data.recentTransactions.length === 0 ? (
            <EmptyState
              title="No recent transactions"
              description="When you add incomes or expenses, your transactions will appear here."
              actionLabel="Add Expense"
              onAction={() => (window.location.href = "/expenses")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="pb-3 px-3">Transaction</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.recentTransactions.map((tx) => {
                    const isIncome = tx.type === "income";
                    return (
                      <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <CategoryIcon
                              icon={tx.icon}
                              type={isIncome ? "income" : "expense"}
                              size="sm"
                            />
                            <span className="font-semibold text-slate-800">{tx.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-xs">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-sm">
                          <span className={isIncome ? "text-emerald-600" : "text-rose-600"}>
                            {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
