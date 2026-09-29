import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Mail,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Wallet,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import AppLayout from "../components/layout/AppLayout";
import { filterApi } from "../api/filterApi";
import { reportApi } from "../api/reportApi";
import { ExpenseDTO, IncomeDTO } from "../types";
import { formatCurrency, formatDate } from "../util/formatters";
import EmptyState from "../components/common/EmptyState";
import CategoryIcon from "../components/common/CategoryIcon";
import { getErrorMessage } from "../api/errorUtil";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

export const ReportsPage: React.FC = () => {
  // Preset or custom dates
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [preset, setPreset] = useState<"this_month" | "last_month" | "last_90" | "custom">(
    "this_month"
  );

  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<IncomeDTO[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);

  // Export loading states
  const [downloadingExpense, setDownloadingExpense] = useState(false);
  const [downloadingIncome, setDownloadingIncome] = useState(false);
  const [emailingExpense, setEmailingExpense] = useState(false);
  const [emailingIncome, setEmailingIncome] = useState(false);

  // Apply preset date changes
  const applyPreset = (newPreset: "this_month" | "last_month" | "last_90" | "custom") => {
    setPreset(newPreset);
    const now = new Date();
    if (newPreset === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      setStartDate(start);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (newPreset === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
      setStartDate(start);
      setEndDate(end);
    } else if (newPreset === "last_90") {
      const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setStartDate(past90);
      setEndDate(now.toISOString().split("T")[0]);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [incomeRes, expenseRes] = await Promise.all([
        filterApi.filterTransactions({
          type: "income",
          startDate,
          endDate,
          sortField: "date",
          sortOrder: "asc",
        }),
        filterApi.filterTransactions({
          type: "expense",
          startDate,
          endDate,
          sortField: "date",
          sortOrder: "asc",
        }),
      ]);
      setIncomes(incomeRes || []);
      setExpenses(expenseRes || []);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  // Aggregate Metrics
  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Category breakdown for expenses
  const categoryMap: {
    [name: string]: { name: string; amount: number; count: number; icon?: string };
  } = {};
  expenses.forEach((e) => {
    const key = e.categoryName || "Uncategorized";
    if (!categoryMap[key]) {
      categoryMap[key] = { name: key, amount: 0, count: 0, icon: e.icon };
    }
    categoryMap[key].amount += Number(e.amount || 0);
    categoryMap[key].count += 1;
  });

  const categoryChartData = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);

  // Income vs Expense Chart Comparison Data
  const comparisonData = [
    {
      name: "Income vs Expense",
      Income: totalIncome,
      Expense: totalExpense,
    },
  ];

  // Export handlers
  const handleDownloadExpense = async () => {
    setDownloadingExpense(true);
    try {
      await reportApi.downloadExpenseExcel();
      toast.success("Expense report downloaded successfully!");
    } catch (err: any) {
      toast.error("Failed to download expense excel");
    } finally {
      setDownloadingExpense(false);
    }
  };

  const handleDownloadIncome = async () => {
    setDownloadingIncome(true);
    try {
      await reportApi.downloadIncomeExcel();
      toast.success("Income report downloaded successfully!");
    } catch (err: any) {
      toast.error("Failed to download income excel");
    } finally {
      setDownloadingIncome(false);
    }
  };

  const handleEmailExpense = async () => {
    setEmailingExpense(true);
    try {
      await reportApi.emailExpenseExcel();
      toast.success("Expense report emailed to your address via Brevo!");
    } catch (err: any) {
      toast.error("Failed to send email");
    } finally {
      setEmailingExpense(false);
    }
  };

  const handleEmailIncome = async () => {
    setEmailingIncome(true);
    try {
      await reportApi.emailIncomeExcel();
      toast.success("Income report emailed to your address via Brevo!");
    } catch (err: any) {
      toast.error("Failed to send email");
    } finally {
      setEmailingIncome(false);
    }
  };

  return (
    <AppLayout pageTitle="Reports">
      <div className="space-y-7 pb-12">
        {/* Header & Date Range Controls */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Financial Reports & Analytics
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Analyze your monthly income, category spending habits, and download statements.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => applyPreset("this_month")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === "this_month"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => applyPreset("last_month")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === "last_month"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Last Month
              </button>
              <button
                type="button"
                onClick={() => applyPreset("last_90")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === "last_90"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                90 Days
              </button>
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPreset("custom");
                }}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPreset("custom");
                }}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* KPI SUMMARY CARDS */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Income */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Period Income
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {incomes.length} income transactions recorded
            </p>
          </div>

          {/* Total Expense */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Period Expense
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-rose-600">
              {formatCurrency(totalExpense)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {expenses.length} expense transactions recorded
            </p>
          </div>

          {/* Net Cash Flow */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Net Cash Flow
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  netSavings >= 0 ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
                }`}
              >
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p
              className={`text-xl sm:text-2xl font-bold ${
                netSavings >= 0 ? "text-indigo-600" : "text-rose-600"
              }`}
            >
              {formatCurrency(netSavings)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {netSavings >= 0 ? "Net surplus" : "Deficit this period"}
            </p>
          </div>

          {/* Savings Rate */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Savings Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p
              className={`text-xl sm:text-2xl font-bold ${
                savingsRate >= 20
                  ? "text-emerald-600"
                  : savingsRate > 0
                  ? "text-amber-600"
                  : "text-slate-600"
              }`}
            >
              {savingsRate}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Retained of total income</p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CHARTS SECTION */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Income vs Expense Comparison */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Income vs Expense</h3>
              <p className="text-xs text-slate-500">Total inflow vs outflow for selected period</p>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : totalIncome === 0 && totalExpense === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No financial records in this date range.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis
                      tickFormatter={(val) => `₹${val}`}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "12px",
                        color: "#fff",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Category Breakdown Donut */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Category-wise Expenses</h3>
              <p className="text-xs text-slate-500">Distribution of expenditures by category</p>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : categoryChartData.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No expense transactions recorded in this period.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatCurrency(val)}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "12px",
                        color: "#fff",
                        border: "none",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CATEGORY BREAKDOWN TABLE */}
        {/* ============================================================ */}
        {categoryChartData.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Detailed Category Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Category spending sorted by total volume during the selected period.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Transactions</th>
                    <th className="py-3 px-4">Share of Total</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {categoryChartData.map((item, idx) => {
                    const percentage =
                      totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
                    return (
                      <tr key={item.name} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span>{item.name}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {item.count} records
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 max-w-[140px]">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: COLORS[idx % COLORS.length],
                                }}
                              />
                            </div>
                            <span className="text-xs text-slate-600 font-semibold">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* EXPORT SECTION */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Export & Download Financial Reports
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download formatted Excel spreadsheets or dispatch reports to your registered email.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Download Expense Excel */}
            <button
              onClick={handleDownloadExpense}
              disabled={downloadingExpense}
              className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Download Expense Excel</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {downloadingExpense ? "Generating .xlsx..." : "Save expenses spreadsheet (.xlsx)"}
              </p>
            </button>

            {/* Download Income Excel */}
            <button
              onClick={handleDownloadIncome}
              disabled={downloadingIncome}
              className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Download Income Excel</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {downloadingIncome ? "Generating .xlsx..." : "Save income spreadsheet (.xlsx)"}
              </p>
            </button>

            {/* Email Expense Excel */}
            <button
              onClick={handleEmailExpense}
              disabled={emailingExpense}
              className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Email Expense Report</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {emailingExpense ? "Dispatching..." : "Send via Brevo SMTP to email"}
              </p>
            </button>

            {/* Email Income Excel */}
            <button
              onClick={handleEmailIncome}
              disabled={emailingIncome}
              className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Email Income Report</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {emailingIncome ? "Dispatching..." : "Send via Brevo SMTP to email"}
              </p>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
