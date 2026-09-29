import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown,
  Calendar,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { filterApi } from "../api/filterApi";
import { ExpenseDTO, IncomeDTO, FilterDTO } from "../types";
import { formatCurrency, formatDate } from "../util/formatters";
import CategoryIcon from "../components/common/CategoryIcon";
import EmptyState from "../components/common/EmptyState";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import { getErrorMessage } from "../api/errorUtil";

export const TransactionsPage: React.FC = () => {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortField, setSortField] = useState<"date" | "amount" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [results, setResults] = useState<(ExpenseDTO | IncomeDTO)[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Execute search
  const executeSearch = async (overrideParams?: Partial<FilterDTO>) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const payload: FilterDTO = {
        type: overrideParams?.type || type,
        startDate: overrideParams?.startDate !== undefined ? overrideParams.startDate : startDate,
        endDate: overrideParams?.endDate !== undefined ? overrideParams.endDate : endDate,
        keyword: overrideParams?.keyword !== undefined ? overrideParams.keyword : keyword,
        sortField: overrideParams?.sortField || sortField,
        sortOrder: overrideParams?.sortOrder || sortOrder,
      };

      const data = await filterApi.filterTransactions(payload);
      setResults(data || []);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    executeSearch();
  }, [type]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setKeyword("");
    setSortField("date");
    setSortOrder("desc");
    executeSearch({
      startDate: "",
      endDate: "",
      keyword: "",
      sortField: "date",
      sortOrder: "desc",
    });
  };

  return (
    <AppLayout pageTitle="Transactions">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transactions</h2>
            <p className="text-xs text-slate-500 mt-1">
              Search and filter your financial activity across expenses and income.
            </p>
          </div>

          {/* Type Toggle Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === "expense"
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Filter Controls Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Filter Criteria</h3>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Keyword Search */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Search Keyword
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Sort By & Order */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Found{" "}
                <strong className="text-slate-800 font-bold">{results.length}</strong>{" "}
                matching records
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Filters
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  {loading ? "Searching..." : "Apply Filters"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Explorer Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {type === "expense" ? "Expense Results" : "Income Results"}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {results.length} results
            </span>
          </div>

          {loading ? (
            <TableSkeleton rows={5} />
          ) : results.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No transactions match your filters"
                description="Try broadening your search keyword, adjusting the date range, or switching types."
                icon={FileSpreadsheet}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-14 text-center">Icon</th>
                    <th className="py-3.5 px-4">Transaction Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {results.map((tx: any) => {
                    const isIncome = type === "income";
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <CategoryIcon
                              icon={tx.icon}
                              type={isIncome ? "income" : "expense"}
                              size="sm"
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {tx.name}
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                            {tx.categoryName || "Uncategorized"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-500 font-medium">
                          {formatDate(tx.date)}
                        </td>

                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            isIncome ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(tx.amount)}
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

export default TransactionsPage;
