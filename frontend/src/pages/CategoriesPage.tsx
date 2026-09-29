import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Tags,
  Check,
  X,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { categoryApi } from "../api/categoryApi";
import { CategoryDTO } from "../types";
import CategoryIcon from "../components/common/CategoryIcon";
import EmptyState from "../components/common/EmptyState";
import { getErrorMessage } from "../api/errorUtil";

export const CategoriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("🏷️");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAllCategories();
      setCategories(data || []);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setFormName("");
    setFormIcon(activeTab === "income" ? "💰" : "💸");
    setIsAddModalOpen(true);
  };

  const openEditModal = (cat: CategoryDTO) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon || "🏷️");
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory && editingCategory.id) {
        // Edit category
        await categoryApi.updateCategory(editingCategory.id, {
          name: formName.trim(),
          icon: formIcon || "🏷️",
          type: editingCategory.type,
        });
        toast.success("Category updated successfully.");
        setEditingCategory(null);
      } else {
        // Create category
        await categoryApi.addCategory({
          name: formName.trim(),
          icon: formIcon || "🏷️",
          type: activeTab,
        });
        toast.success("Category created successfully.");
        setIsAddModalOpen(false);
      }
      fetchCategories();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories by active tab
  const filteredCategories = categories.filter((cat) => cat.type === activeTab);

  const EMOJI_OPTIONS =
    activeTab === "income"
      ? ["💰", "💼", "📈", "💵", "🎁", "🏦", "💎", "🪙", "🤝", "🏆"]
      : ["🍔", "🛒", "☕", "🚗", "🏠", "💊", "🎬", "✈️", "📱", "💡", "👕", "📚"];

  return (
    <AppLayout pageTitle="Categories">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Category Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Organize your income sources and expense spending classifications.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            + Add {activeTab === "income" ? "Income" : "Expense"} Category
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("expense")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "expense"
                ? "bg-white text-rose-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Expense Categories</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-100">
              {categories.filter((c) => c.type === "expense").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("income")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "income"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Income Categories</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100">
              {categories.filter((c) => c.type === "income").length}
            </span>
          </button>
        </div>

        {/* Category Cards Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-3 bg-slate-100 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="No categories yet"
                description={`You haven't created any ${activeTab} categories yet. Add one to categorize your transactions.`}
                actionLabel={`+ Add ${activeTab === "income" ? "Income" : "Expense"} Category`}
                onAction={openAddModal}
                icon={Tags}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/70 hover:border-indigo-200 hover:bg-indigo-50/20 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <CategoryIcon
                      icon={category.icon}
                      type={category.type === "income" ? "income" : "expense"}
                      size="md"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-900 transition-colors">
                        {category.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-400 capitalize">
                        {category.type}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Edit category"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategory ? "Edit Category" : `Add New ${activeTab === "income" ? "Income" : "Expense"} Category`}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 pt-4">
              {/* Emoji Picker Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Category Emoji / Icon
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setFormIcon(emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                        formIcon === emoji
                          ? "bg-indigo-100 border-2 border-indigo-600 scale-110 shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 border border-transparent"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  <input
                    type="text"
                    placeholder="Custom"
                    maxLength={4}
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-20 px-2 py-1.5 text-center text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dining Out, Rental Income"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default CategoriesPage;
