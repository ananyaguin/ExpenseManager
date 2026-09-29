import React, { useState, useEffect } from "react";
import {
  Plus,
  Download,
  Mail,
  Trash2,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import { incomeApi } from "../api/incomeApi";
import { reportApi } from "../api/reportApi";
import { IncomeDTO } from "../types";
import { formatCurrency, formatDate } from "../util/formatters";
import { TableSkeleton } from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import CategoryIcon from "../components/common/CategoryIcon";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import AddIncomeModal from "../components/modals/AddIncomeModal";
import { getErrorMessage } from "../api/errorUtil";

export const IncomesPage: React.FC = () => {
  const [incomes, setIncomes] = useState<IncomeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action loading states
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const data = await incomeApi.getIncomes();
      setIncomes(data || []);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await incomeApi.deleteIncome(deleteId);
      toast.success("Income deleted successfully.");
      setDeleteId(null);
      fetchIncomes();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      await reportApi.downloadIncomeExcel();
      toast.success("Income report downloaded successfully.");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailReport = async () => {
    setIsEmailing(true);
    try {
      await reportApi.emailIncomeExcel();
      toast.success("Income report has been emailed successfully.");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsEmailing(false);
    }
  };

  const totalIncomeAmount = incomes.reduce((acc, inc) => acc + Number(inc.amount || 0), 0);

  return (
    <AppLayout pageTitle="Income">
      <div className="space-y-6">
        {/* Top Header & Action Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Current Month Income
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total Income this month:{" "}
              <span className="font-bold text-emerald-600 text-sm">
                {formatCurrency(totalIncomeAmount)}
              </span>{" "}
              ({incomes.length} records)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadExcel}
              disabled={isDownloading || incomes.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              {isDownloading ? "Downloading..." : "Download Excel"}
            </button>

            <button
              onClick={handleEmailReport}
              disabled={isEmailing || incomes.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {isEmailing ? "Sending..." : "Email Report"}
            </button>

            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Add Income
            </button>
          </div>
        </div>

        {/* Income Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : incomes.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No income records this month"
                description="Keep track of your earnings and cash inflow by recording your income."
                actionLabel="+ Add Income"
                onAction={() => setAddModalOpen(true)}
                icon={FileSpreadsheet}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-14 text-center">Icon</th>
                    <th className="py-3.5 px-4">Income Source</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {incomes.map((income) => (
                    <tr
                      key={income.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Icon */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <CategoryIcon icon={income.icon} type="income" size="sm" />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {income.name}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                          {income.categoryName || "Uncategorized"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-xs text-slate-500 font-medium">
                        {formatDate(income.date)}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        +{formatCurrency(income.amount)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setDeleteId(income.id ?? null)}
                          title="Delete Income"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      <AddIncomeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchIncomes}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Income"
        message="Are you sure you want to delete this income record? This action cannot be undone."
        isLoading={isDeleting}
      />
    </AppLayout>
  );
};

export default IncomesPage;
