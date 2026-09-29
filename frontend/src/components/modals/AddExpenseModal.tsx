import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Sparkles, Check } from "lucide-react";
import toast from "react-hot-toast";
import { CategoryDTO } from "../../types";
import { categoryApi } from "../../api/categoryApi";
import { expenseApi } from "../../api/expenseApi";
import { getErrorMessage } from "../../api/errorUtil";

const expenseSchema = z.object({
  name: z.string().min(1, "Expense name is required"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  categoryId: z.string().min(1, "Category is required"),
  icon: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_ICONS = ["🍔", "🛒", "☕", "🚗", "🏠", "💊", "🎬", "✈️", "📱", "💡"];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline new category state
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("🏷️");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      date: today,
      categoryId: "",
      icon: "💸",
    },
  });

  const selectedIcon = watch("icon") || "💸";

  // Load expense categories
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryApi.getCategoriesByType("expense");
      setCategories(data);
      if (data.length > 0 && !watch("categoryId")) {
        setValue("categoryId", String(data[0].id));
      }
    } catch (err) {
      console.error("Failed to fetch expense categories", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      reset({
        name: "",
        amount: undefined,
        date: today,
        categoryId: "",
        icon: "💸",
      });
      setShowNewCategory(false);
      setNewCategoryName("");
    }
  }, [isOpen]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setCreatingCategory(true);
    try {
      const created = await categoryApi.addCategory({
        name: newCategoryName.trim(),
        icon: newCategoryIcon || "🏷️",
        type: "expense",
      });
      toast.success(`Category "${created.name}" created`);
      setNewCategoryName("");
      setShowNewCategory(false);
      // Reload categories and select newly created
      const updatedList = await categoryApi.getCategoriesByType("expense");
      setCategories(updatedList);
      if (created.id) {
        setValue("categoryId", String(created.id));
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreatingCategory(false);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      await expenseApi.addExpense({
        name: data.name.trim(),
        icon: data.icon || "💸",
        categoryId: data.categoryId,
        amount: Number(data.amount),
        date: data.date,
      });

      toast.success("Expense added successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Add New Expense</h3>
            <p className="text-xs text-slate-500 mt-0.5">Record a spending transaction</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-5">
          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Expense Icon / Emoji
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {DEFAULT_ICONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setValue("icon", emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    selectedIcon === emoji
                      ? "bg-rose-100 border-2 border-rose-500 scale-110 shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 border border-transparent"
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <input
                type="text"
                placeholder="Or custom emoji"
                maxLength={4}
                className="w-32 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedIcon}
                onChange={(e) => setValue("icon", e.target.value)}
              />
            </div>
          </div>

          {/* Expense Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Grocery Shopping, Electricity Bill"
              {...register("name")}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-rose-300 bg-rose-50/30 focus:ring-rose-400"
                  : "border-slate-200 bg-white focus:ring-indigo-500"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Amount and Date in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="500.00"
                  {...register("amount", { valueAsNumber: true })}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.amount
                      ? "border-rose-300 bg-rose-50/30 focus:ring-rose-400"
                      : "border-slate-200 bg-white focus:ring-indigo-500"
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register("date")}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.date
                    ? "border-rose-300 bg-rose-50/30 focus:ring-rose-400"
                    : "border-slate-200 bg-white focus:ring-indigo-500"
                }`}
              />
              {errors.date && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Category Dropdown & Inline Creator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Category <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showNewCategory ? "Cancel category" : "Create new category"}
              </button>
            </div>

            <select
              {...register("categoryId")}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.categoryId
                  ? "border-rose-300 bg-rose-50/30 focus:ring-rose-400"
                  : "border-slate-200 bg-white focus:ring-indigo-500"
              }`}
            >
              <option value="">Select an expense category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.categoryId.message}</p>
            )}

            {/* Inline Category Creation Box */}
            {showNewCategory && (
              <div className="mt-3 p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                <p className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Quickly Add New Expense Category
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Emoji"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    className="w-16 px-2.5 py-2 text-center text-sm bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength={4}
                  />
                  <input
                    type="text"
                    placeholder="New category name (e.g., Dining)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-sm shadow-indigo-600/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {creatingCategory ? "Adding..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                "+ Add Expense"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
