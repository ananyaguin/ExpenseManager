import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
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
import { DashboardData, RecentTransaction } from "../types";
import { formatCurrency, formatDate, formatShortDate } from "../util/formatters";
import { CardSkeleton, ChartSkeleton, TableSkeleton } from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import CategoryIcon from "../components/common/CategoryIcon";
import { getErrorMessage } from "../api/errorUtil";

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getDashboardData();
      setData(res);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Prepare chart data from recent transactions or recent incomes/expenses
  const prepareChartData = () => {
    if (!data) return [];

    const txMap: { [date: string]: { date: string; income: number; expense: number } } = {};

    // Group transactions by date
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

    // Also include recentIncomes and recentExpenses if not already in txMap
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

    // Sort by date ascending
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
      <div className="space-y-7">
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
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors"
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

        {/* ============================================================ */}
        {/* SUMMARY CARDS */}
        {/* ============================================================ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Balance Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-indigo-100/50 transition-colors"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Balance
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <WalletCards className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">
                {formatCurrency(data?.totalBalance)}
              </div>
              <p className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                <span>Net available funds</span>
              </p>
            </div>

            {/* Total Income Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-100/50 transition-colors"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Income
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight mb-1">
                {formatCurrency(data?.totalIncome)}
              </div>
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Total earnings</span>
              </p>
            </div>

            {/* Total Expense Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-rose-100/50 transition-colors"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Expense
                </span>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight mb-1">
                {formatCurrency(data?.totalExpense)}
              </div>
              <p className="text-xs font-medium text-rose-700 flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Total spendings</span>
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CHART SECTION & QUICK SUMMARY */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income vs Expense Chart (2 columns) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
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
                    <Legend
                      wrapperStyle={{ paddingTop: "14px", fontSize: "12px" }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill="#f43f5e"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick Summary Side Box (1 column) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Cash Flow Balance</h3>
              <p className="text-xs text-slate-500 mb-5">Current month financial health</p>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
                    <span>Income Share</span>
                    <span className="text-emerald-600 font-bold">
                      {data?.totalIncome && (Number(data.totalIncome) + Number(data.totalExpense)) > 0
                        ? `${Math.round(
                            (Number(data.totalIncome) /
                              (Number(data.totalIncome) + Number(data.totalExpense))) *
                              100
                          )}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          data?.totalIncome &&
                          Number(data.totalIncome) + Number(data.totalExpense) > 0
                            ? Math.round(
                                (Number(data.totalIncome) /
                                  (Number(data.totalIncome) + Number(data.totalExpense))) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
                    <span>Expense Ratio</span>
                    <span className="text-rose-600 font-bold">
                      {data?.totalExpense && (Number(data.totalIncome) + Number(data.totalExpense)) > 0
                        ? `${Math.round(
                            (Number(data.totalExpense) /
                              (Number(data.totalIncome) + Number(data.totalExpense))) *
                              100
                          )}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          data?.totalExpense &&
                          Number(data.totalIncome) + Number(data.totalExpense) > 0
                            ? Math.round(
                                (Number(data.totalExpense) /
                                  (Number(data.totalIncome) + Number(data.totalExpense))) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                to="/transactions"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Explore Full Transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RECENT TRANSACTIONS TABLE */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
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
