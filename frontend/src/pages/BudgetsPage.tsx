import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Repeat,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { expenseApi } from "../api/expenseApi";
import { categoryApi } from "../api/categoryApi";
import { ExpenseDTO, CategoryDTO } from "../types";
import { formatCurrency } from "../util/formatters";
import { useAuth } from "../context/AuthContext";
import {
  getBudgetConfig,
  saveBudgetConfig,
  getRecurringExpenses,
  saveRecurringExpenses,
  BudgetConfig,
  RecurringExpense,
} from "../util/budgetStorage";
import { addNotification } from "../util/notificationStorage";
import CategoryIcon from "../components/common/CategoryIcon";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import EmptyState from "../components/common/EmptyState";

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || user?.email;

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);

  // Budget state
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>({
    monthlyBudget: 0,
    categoryBudgets: [],
  });

  // Modal states
  const [editMonthlyOpen, setEditMonthlyOpen] = useState(false);
  const [monthlyInput, setMonthlyInput] = useState("");

  const [editCategoryModal, setEditCategoryModal] = useState<{
    isOpen: boolean;
    categoryId: string | number;
    categoryName: string;
    currentAmount: number;
  }>({
    isOpen: false,
    categoryId: "",
    categoryName: "",
    currentAmount: 0,
  });
  const [categoryInput, setCategoryInput] = useState("");

  // Recurring Expenses state
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [addRecurringOpen, setAddRecurringOpen] = useState(false);
  const [recurringForm, setRecurringForm] = useState<{
    name: string;
    amount: string;
    categoryId: string;
    frequency: "weekly" | "monthly" | "yearly";
    nextDueDate: string;
  }>({
    name: "",
    amount: "",
    categoryId: "",
    frequency: "monthly",
    nextDueDate: new Date().toISOString().split("T")[0],
  });

  // Delete modal state
  const [deleteRecurringId, setDeleteRecurringId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expData, catData] = await Promise.all([
        expenseApi.getExpenses(),
        categoryApi.getCategoriesByType("expense"),
      ]);
      setExpenses(expData || []);
      setCategories(catData || []);

      const savedBudget = getBudgetConfig(userId);
      setBudgetConfig(savedBudget);

      const savedRecurring = getRecurringExpenses(userId);
      setRecurringExpenses(savedRecurring);

      // Check budget warnings and trigger notifications
      checkBudgetAlerts(expData || [], savedBudget);
    } catch (err: any) {
      toast.error("Failed to load budget and spending records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const checkBudgetAlerts = (currentExpenses: ExpenseDTO[], config: BudgetConfig) => {
    if (config.monthlyBudget <= 0) return;
    const totalSpent = currentExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const ratio = totalSpent / config.monthlyBudget;

    if (ratio >= 1) {
      addNotification(
        {
          type: "budget_exceeded",
          title: "Budget Exceeded",
          message: `You have spent ${formatCurrency(totalSpent)}, exceeding your monthly budget limit of ${formatCurrency(config.monthlyBudget)}.`,
        },
        userId
      );
    } else if (ratio >= 0.8) {
      addNotification(
        {
          type: "budget_warning",
          title: "Budget Warning (80% Reached)",
          message: `You have reached ${Math.round(ratio * 100)}% of your monthly budget (${formatCurrency(totalSpent)} / ${formatCurrency(config.monthlyBudget)}).`,
        },
        userId
      );
    }
  };

  // Calculations
  const totalSpentThisMonth = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const monthlyBudget = budgetConfig.monthlyBudget;
  const isBudgetSet = monthlyBudget > 0;
  const budgetRatio = isBudgetSet ? (totalSpentThisMonth / monthlyBudget) * 100 : 0;
  const isOverBudget = isBudgetSet && totalSpentThisMonth > monthlyBudget;
  const isNearLimit = isBudgetSet && !isOverBudget && budgetRatio >= 80;
  const remainingBudget = monthlyBudget - totalSpentThisMonth;

  // Category spending map
  const categorySpentMap: { [catId: string]: number } = {};
  expenses.forEach((e) => {
    const key = String(e.categoryId || e.categoryName);
    categorySpentMap[key] = (categorySpentMap[key] || 0) + Number(e.amount || 0);
  });

  // Handlers for Overall Budget
  const handleSaveMonthlyBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(monthlyInput);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    const updated = { ...budgetConfig, monthlyBudget: val };
    setBudgetConfig(updated);
    saveBudgetConfig(updated, userId);
    setEditMonthlyOpen(false);
    toast.success("Monthly budget updated successfully!");
    checkBudgetAlerts(expenses, updated);
  };

  // Handlers for Category Budget
  const handleSaveCategoryBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(categoryInput);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const filtered = budgetConfig.categoryBudgets.filter(
      (b) => String(b.categoryId) !== String(editCategoryModal.categoryId)
    );
    const updatedCategoryBudgets = [
      ...filtered,
      {
        categoryId: editCategoryModal.categoryId,
        categoryName: editCategoryModal.categoryName,
        budgetAmount: val,
      },
    ];
    const updated = { ...budgetConfig, categoryBudgets: updatedCategoryBudgets };
    setBudgetConfig(updated);
    saveBudgetConfig(updated, userId);
    setEditCategoryModal({ ...editCategoryModal, isOpen: false });
    toast.success(`Budget for ${editCategoryModal.categoryName} updated!`);
  };

  // Handlers for Recurring Expenses
  const handleAddRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recurringForm.name.trim()) {
      toast.error("Please enter expense name");
      return;
    }
    const amountNum = parseFloat(recurringForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }
    const category = categories.find((c) => String(c.id) === recurringForm.categoryId);
    const newItem: RecurringExpense = {
      id: `rec_${Date.now()}`,
      name: recurringForm.name.trim(),
      amount: amountNum,
      categoryId: recurringForm.categoryId || (categories[0]?.id ? String(categories[0].id) : "1"),
      categoryName: category?.name || "General",
      frequency: recurringForm.frequency,
      nextDueDate: recurringForm.nextDueDate || new Date().toISOString().split("T")[0],
    };

    const updated = [newItem, ...recurringExpenses];
    setRecurringExpenses(updated);
    saveRecurringExpenses(updated, userId);
    setAddRecurringOpen(false);
    setRecurringForm({
      name: "",
      amount: "",
      categoryId: "",
      frequency: "monthly",
      nextDueDate: new Date().toISOString().split("T")[0],
    });
    toast.success("Recurring expense schedule created!");
  };

  const handleRecordRecurringNow = async (item: RecurringExpense) => {
    try {
      await expenseApi.addExpense({
        name: item.name,
        amount: item.amount,
        categoryId: item.categoryId,
        date: new Date().toISOString().split("T")[0],
        icon: "🔁",
      });
      toast.success(`Recorded "${item.name}" of ${formatCurrency(item.amount)} to expenses!`);
      addNotification(
        {
          type: "transaction_added",
          title: "Recurring Expense Recorded",
          message: `Recorded "${item.name}" for ${formatCurrency(item.amount)} to current month expenses.`,
        },
        userId
      );
      fetchData();
    } catch (err: any) {
      toast.error("Failed to record expense to database");
    }
  };

  const handleDeleteRecurring = () => {
    if (!deleteRecurringId) return;
    const updated = recurringExpenses.filter((r) => r.id !== deleteRecurringId);
    setRecurringExpenses(updated);
    saveRecurringExpenses(updated, userId);
    setDeleteRecurringId(null);
    toast.success("Recurring expense removed");
  };

  return (
    <AppLayout pageTitle="Budget Management">
      <div className="space-y-7 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Budget & Expense Planning
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Set spending limits, monitor category progress, and track recurring bills.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setMonthlyInput(monthlyBudget ? String(monthlyBudget) : "");
                setEditMonthlyOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              {isBudgetSet ? "Edit Monthly Budget" : "Set Monthly Budget"}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 1. OVERALL MONTHLY BUDGET CARD */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs relative overflow-hidden">
          {/* Status Background Accent */}
          <div
            className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
              isOverBudget
                ? "bg-rose-500/10"
                : isNearLimit
                ? "bg-amber-500/10"
                : "bg-indigo-500/10"
            }`}
          />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isOverBudget
                      ? "bg-rose-50 text-rose-600"
                      : isNearLimit
                      ? "bg-amber-50 text-amber-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Current Month Overall Budget
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time spending tracked against your monthly target
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div>
                {isOverBudget ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Budget Exceeded
                  </span>
                ) : isNearLimit ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Warning: 80% Limit Reached
                  </span>
                ) : isBudgetSet ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Within Budget Target
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    No Budget Set
                  </span>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 py-6">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Monthly Budget Limit
                </span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {isBudgetSet ? formatCurrency(monthlyBudget) : "Not Configured"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Assigned monthly cap</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Spent This Month
                </span>
                <p
                  className={`text-xl sm:text-2xl font-bold mt-1 ${
                    isOverBudget ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  {formatCurrency(totalSpentThisMonth)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Across {expenses.length} expense records
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {isOverBudget ? "Amount Over Budget" : "Remaining Allowance"}
                </span>
                <p
                  className={`text-xl sm:text-2xl font-bold mt-1 ${
                    isOverBudget
                      ? "text-rose-600"
                      : isNearLimit
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {isBudgetSet ? formatCurrency(Math.abs(remainingBudget)) : "—"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isOverBudget ? "Overspent limit" : "Available to spend"}
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            {isBudgetSet && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600">
                    Budget Utilization: {Math.round(budgetRatio)}%
                  </span>
                  <span
                    className={
                      isOverBudget
                        ? "text-rose-600 font-bold"
                        : isNearLimit
                        ? "text-amber-600 font-bold"
                        : "text-emerald-600 font-bold"
                    }
                  >
                    {isOverBudget
                      ? `Exceeded by ${formatCurrency(totalSpentThisMonth - monthlyBudget)}`
                      : `${formatCurrency(remainingBudget)} remaining`}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isOverBudget
                        ? "bg-rose-500"
                        : isNearLimit
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(budgetRatio, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. CATEGORY-WISE BUDGET SECTION */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Category Budget Allocations
              </h2>
              <p className="text-xs text-slate-500">
                Set individual budget limits per category to prevent overspending.
              </p>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
              <p className="text-sm text-slate-500">No expense categories available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const catSpent =
                  categorySpentMap[String(cat.id)] ||
                  categorySpentMap[cat.name] ||
                  0;
                const catBudgetObj = budgetConfig.categoryBudgets.find(
                  (b) => String(b.categoryId) === String(cat.id)
                );
                const catBudget = catBudgetObj ? catBudgetObj.budgetAmount : 0;
                const hasCatBudget = catBudget > 0;
                const catRatio = hasCatBudget ? (catSpent / catBudget) * 100 : 0;
                const catOver = hasCatBudget && catSpent > catBudget;
                const catNear = hasCatBudget && !catOver && catRatio >= 80;

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <CategoryIcon icon={cat.icon} type="expense" size="sm" />
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {cat.name}
                          </h4>
                        </div>

                        <button
                          onClick={() => {
                            setEditCategoryModal({
                              isOpen: true,
                              categoryId: cat.id || "",
                              categoryName: cat.name,
                              currentAmount: catBudget,
                            });
                            setCategoryInput(catBudget ? String(catBudget) : "");
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Set budget for category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Spent vs Budget */}
                      <div className="space-y-1 my-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-slate-500">Spent this month</span>
                          <span className="font-bold text-sm text-slate-900">
                            {formatCurrency(catSpent)}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-slate-500">Budget Limit</span>
                          <span className="font-semibold text-xs text-slate-600">
                            {hasCatBudget ? formatCurrency(catBudget) : "Not Set"}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {hasCatBudget ? (
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[11px] font-medium">
                            <span
                              className={
                                catOver
                                  ? "text-rose-600 font-bold"
                                  : catNear
                                  ? "text-amber-600 font-bold"
                                  : "text-slate-500"
                              }
                            >
                              {catOver
                                ? "Budget Exceeded"
                                : catNear
                                ? "80% Limit Warning"
                                : `${Math.round(catRatio)}% utilized`}
                            </span>
                            <span className="text-slate-500">
                              {catOver
                                ? `+${formatCurrency(catSpent - catBudget)}`
                                : `${formatCurrency(catBudget - catSpent)} left`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                catOver
                                  ? "bg-rose-500"
                                  : catNear
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(catRatio, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setEditCategoryModal({
                                isOpen: true,
                                categoryId: cat.id || "",
                                categoryName: cat.name,
                                currentAmount: 0,
                              });
                              setCategoryInput("");
                            }}
                            className="w-full py-1.5 rounded-lg border border-dashed border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 text-xs font-medium transition-colors"
                          >
                            + Set category budget
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 3. RECURRING EXPENSES SECTION */}
        {/* ============================================================ */}
        <div className="space-y-4 pt-4 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Recurring Bills & Subscriptions
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage recurring payments (rent, gym, utilities) and record them with one click.
              </p>
            </div>

            <button
              onClick={() => setAddRecurringOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              Add Recurring Expense
            </button>
          </div>

          {recurringExpenses.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center">
              <Repeat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No recurring expenses scheduled</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                Add subscriptions or regular bills like Netflix, Wi-Fi, or Rent to easily log them each month.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Expense Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Frequency</th>
                      <th className="py-3 px-4">Next Due Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {recurringExpenses.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {rec.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                            {rec.categoryName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-xs font-medium text-slate-600 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                            {rec.frequency}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-medium">
                          {rec.nextDueDate}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(rec.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRecordRecurringNow(rec)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors cursor-pointer"
                              title="Record this expense to database now"
                            >
                              Log to Month
                            </button>
                            <button
                              onClick={() => setDeleteRecurringId(rec.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Delete recurring schedule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Edit Overall Monthly Budget */}
        {editMonthlyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Configure Monthly Budget
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your total spending limit for the current month.
              </p>
              <form onSubmit={handleSaveMonthlyBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Budget Target (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="e.g. 25000"
                    value={monthlyInput}
                    onChange={(e) => setMonthlyInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMonthlyOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Save Target
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Category Budget */}
        {editCategoryModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Set Budget: {editCategoryModal.categoryName}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter maximum monthly spending allocated to this category.
              </p>
              <form onSubmit={handleSaveCategoryBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="e.g. 5000"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditCategoryModal({ ...editCategoryModal, isOpen: false })}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Save Category Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Recurring Expense */}
        {addRecurringOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Add Recurring Expense
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Schedule recurring subscriptions or monthly bills.
              </p>
              <form onSubmit={handleAddRecurring} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expense Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Netflix, Rent, Electricity"
                    value={recurringForm.name}
                    onChange={(e) => setRecurringForm({ ...recurringForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      placeholder="0.00"
                      value={recurringForm.amount}
                      onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={recurringForm.frequency}
                      onChange={(e) =>
                        setRecurringForm({
                          ...recurringForm,
                          frequency: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={recurringForm.categoryId}
                      onChange={(e) =>
                        setRecurringForm({ ...recurringForm, categoryId: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Next Due Date
                    </label>
                    <input
                      type="date"
                      value={recurringForm.nextDueDate}
                      onChange={(e) =>
                        setRecurringForm({ ...recurringForm, nextDueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddRecurringOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Schedule Recurring Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={!!deleteRecurringId}
          onClose={() => setDeleteRecurringId(null)}
          onConfirm={handleDeleteRecurring}
          title="Delete Recurring Expense"
          message="Are you sure you want to remove this recurring schedule? This won't affect previously logged transactions."
        />
      </div>
    </AppLayout>
  );
};

export default BudgetsPage;
