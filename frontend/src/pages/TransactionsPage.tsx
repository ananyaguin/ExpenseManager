import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  ArrowUpDown,
  Calendar,
  Layers,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { filterApi } from "../api/filterApi";
import { categoryApi } from "../api/categoryApi";
import { expenseApi } from "../api/expenseApi";
import { incomeApi } from "../api/incomeApi";
import { ExpenseDTO, IncomeDTO, FilterDTO, CategoryDTO } from "../types";
import { formatCurrency, formatDate } from "../util/formatters";
import CategoryIcon from "../components/common/CategoryIcon";
import EmptyState from "../components/common/EmptyState";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import { getErrorMessage } from "../api/errorUtil";
import { useAuth } from "../context/AuthContext";
import { addNotification } from "../util/notificationStorage";

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || user?.email;

  const [type, setType] = useState<"expense" | "income">("expense");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortField, setSortField] = useState<"date" | "amount" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [results, setResults] = useState<(ExpenseDTO | IncomeDTO)[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | string | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    tx: (ExpenseDTO | IncomeDTO) | null;
    name: string;
    amount: string;
    date: string;
    categoryId: string;
    icon: string;
  }>({
    isOpen: false,
    tx: null,
    name: "",
    amount: "",
    date: "",
    categoryId: "",
    icon: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Load categories when type changes
  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategoriesByType(type);
      setCategories(data || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  useEffect(() => {
    loadCategories();
    setSelectedCategory("");
  }, [type]);

  // Execute search
  const executeSearch = async (overrideParams?: Partial<FilterDTO>) => {
    setLoading(true);
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
    setSelectedCategory("");
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

  // Filter results client-side if a specific category was selected
  const displayedResults = results.filter((tx) => {
    if (!selectedCategory) return true;
    return (
      String(tx.categoryId) === selectedCategory ||
      tx.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  // Handle Delete Transaction
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      if (type === "expense") {
        await expenseApi.deleteExpense(deleteModal.id);
      } else {
        await incomeApi.deleteIncome(deleteModal.id);
      }
      toast.success("Transaction deleted successfully");
      setDeleteModal({ isOpen: false, id: null, name: "" });
      executeSearch();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (tx: ExpenseDTO | IncomeDTO) => {
    setEditModal({
      isOpen: true,
      tx,
      name: tx.name,
      amount: String(tx.amount),
      date: tx.date,
      categoryId: String(tx.categoryId || (categories[0]?.id ? categories[0].id : "")),
      icon: tx.icon || (type === "income" ? "💰" : "💸"),
    });
  };

  // Save Edit Transaction
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.tx || !editModal.tx.id) return;

    const amountNum = parseFloat(editModal.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsUpdating(true);
    try {
      // Delete old record and add updated record to maintain backend state seamlessly
      if (type === "expense") {
        await expenseApi.deleteExpense(editModal.tx.id);
        await expenseApi.addExpense({
          name: editModal.name.trim(),
          amount: amountNum,
          date: editModal.date,
          categoryId: editModal.categoryId,
          icon: editModal.icon,
        });
      } else {
        await incomeApi.deleteIncome(editModal.tx.id);
        await incomeApi.addIncome({
          name: editModal.name.trim(),
          amount: amountNum,
          date: editModal.date,
          categoryId: editModal.categoryId,
          icon: editModal.icon,
        });
      }

      toast.success("Transaction updated successfully!");
      addNotification(
        {
          type: "transaction_added",
          title: "Transaction Updated",
          message: `Updated "${editModal.name.trim()}" for ${formatCurrency(amountNum)}.`,
        },
        userId
      );
      setEditModal({ ...editModal, isOpen: false, tx: null });
      executeSearch();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AppLayout pageTitle="Transactions">
      <div className="space-y-6 pb-12">
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transactions Explorer</h2>
            <p className="text-xs text-slate-500 mt-1">
              Search, filter by category or date, and edit your transactions.
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Filter Criteria</h3>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Keyword Search */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Search Keyword
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Filter By Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as any)}
                    className="w-full px-1.5 py-2 rounded-xl border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="name">Name</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full px-1.5 py-2 rounded-xl border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <strong className="text-slate-800 font-bold">{displayedResults.length}</strong>{" "}
                matching records
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Filters
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  {loading ? "Searching..." : "Apply Filters"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Explorer Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {type === "expense" ? "Expense Results" : "Income Results"}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {displayedResults.length} records
            </span>
          </div>

          {loading ? (
            <TableSkeleton rows={5} />
          ) : displayedResults.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No transactions match your filters"
                description="Try broadening your search keyword, adjusting the date range, or switching category."
                icon={FileSpreadsheet}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">Icon</th>
                    <th className="py-3 px-4">Transaction Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {displayedResults.map((tx: any) => {
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
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
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

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  id: tx.id,
                                  name: tx.name,
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Edit Transaction */}
        {editModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
              <button
                onClick={() => setEditModal({ ...editModal, isOpen: false })}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                Edit {type === "expense" ? "Expense" : "Income"}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Update transaction details and category.
              </p>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title / Description
                  </label>
                  <input
                    type="text"
                    value={editModal.name}
                    onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editModal.amount}
                      onChange={(e) => setEditModal({ ...editModal, amount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editModal.date}
                      onChange={(e) => setEditModal({ ...editModal, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editModal.categoryId}
                    onChange={(e) => setEditModal({ ...editModal, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditModal({ ...editModal, isOpen: false })}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete */}
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
          onConfirm={handleConfirmDelete}
          title="Delete Transaction"
          message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      </div>
    </AppLayout>
  );
};

export default TransactionsPage;
