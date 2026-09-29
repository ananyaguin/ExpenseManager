import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

import Dashboard from "../components/Dashboard.jsx";
import ExpenseOverview from "../components/ExpenseOverview.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import Modal from "../components/Modal.jsx";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";

const Expense = () => {
    useUser();

    const [expenseData, setExpenseData] = useState([]);
    const [categories, setCategories] = useState([]);

    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);

    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });

    // ==============================
    // GET ALL EXPENSES
    // ==============================
    const fetchExpenseDetails = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.GET_ALL_EXPENSE
            );

            if (response.status === 200) {
                setExpenseData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch expense details:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch expense details."
            );
        }
    };

    // ==============================
    // GET EXPENSE CATEGORIES
    // ==============================
    const fetchExpenseCategories = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.CATEGORY_BY_TYPE("expense")
            );

            if (response.status === 200) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch expense categories:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch expense categories."
            );
        }
    };

    // ==============================
    // ADD EXPENSE
    // ==============================
    const handleAddExpense = async (expense) => {
        const {
            name,
            categoryId,
            amount,
            date,
            icon,
        } = expense;

        // Name validation
        if (!name?.trim()) {
            toast.error("Name is required.");
            return;
        }

        // Category validation
        if (!categoryId) {
            toast.error("Category is required.");
            return;
        }

        // Amount validation
        if (
            !amount ||
            isNaN(amount) ||
            Number(amount) <= 0
        ) {
            toast.error(
                "Amount should be a valid number greater than 0."
            );
            return;
        }

        // Date validation
        if (!date) {
            toast.error("Date is required.");
            return;
        }

        const today = new Date()
            .toISOString()
            .split("T")[0];

        if (date > today) {
            toast.error("Date cannot be in the future.");
            return;
        }

        try {
            const response = await axiosConfig.post(
                API_ENDPOINTS.ADD_EXPENSE,
                {
                    name,
                    categoryId,
                    amount: Number(amount),
                    date,
                    icon,
                }
            );

            if (response.status === 201 || response.status === 200) {
                setOpenAddExpenseModal(false);

                toast.success(
                    "Expense added successfully"
                );

                // Refresh data
                fetchExpenseDetails();
                fetchExpenseCategories();
            }
        } catch (error) {
            console.error(
                "Error adding expense:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to add expense."
            );
        }
    };

    // ==============================
    // DELETE EXPENSE
    // ==============================
    const deleteExpense = async (id) => {
        try {
            await axiosConfig.delete(
                API_ENDPOINTS.DELETE_EXPENSE(id)
            );

            setOpenDeleteAlert({
                show: false,
                data: null,
            });

            toast.success(
                "Expense details deleted successfully"
            );

            // Refresh expense list
            fetchExpenseDetails();

        } catch (error) {
            console.error(
                "Error deleting expense:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to delete expense."
            );
        }
    };

    // ==============================
    // DOWNLOAD EXPENSE EXCEL
    // ==============================
    const handleDownloadExpenseDetails = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.EXPENSE_EXCEL_DOWNLOAD,
                {
                    responseType: "blob",
                }
            );

            const filename = "expense_details.xlsx";

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;
            link.setAttribute(
                "download",
                filename
            );

            document.body.appendChild(link);

            link.click();

            link.parentNode.removeChild(link);

            window.URL.revokeObjectURL(url);

            toast.success(
                "Expense details downloaded successfully!"
            );

        } catch (error) {
            console.error(
                "Error downloading expense details:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to download expense details."
            );
        }
    };

    // ==============================
    // EMAIL EXPENSE DETAILS
    // ==============================
    const handleEmailExpenseDetails = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.EMAIL_EXPENSE
            );

            if (response.status === 200) {
                toast.success("Email sent successfully");
            }

        } catch (error) {
            console.error(
                "Error emailing expense details:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to email expense details."
            );
        }
    };

    // ==============================
    // LOAD DATA WHEN PAGE OPENS
    // ==============================
    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                const [
                    expenseResponse,
                    categoryResponse,
                ] = await Promise.all([
                    axiosConfig.get(
                        API_ENDPOINTS.GET_ALL_EXPENSE
                    ),

                    axiosConfig.get(
                        API_ENDPOINTS.CATEGORY_BY_TYPE("expense")
                    ),
                ]);

                if (cancelled) return;

                if (expenseResponse.status === 200) {
                    setExpenseData(
                        expenseResponse.data
                    );
                }

                if (categoryResponse.status === 200) {
                    setCategories(
                        categoryResponse.data
                    );
                }

            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Failed to load expense data:",
                    error
                );

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load expense data."
                );
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Dashboard activeMenu="Expense">

            <div className="my-5 mx-auto">

                <div className="grid grid-cols-1 gap-6">

                    {/* Expense Overview */}
                    <div>
                        <ExpenseOverview
                            transactions={expenseData}
                            onExpenseIncome={() =>
                                setOpenAddExpenseModal(true)
                            }
                        />
                    </div>

                    {/* Expense List */}
                    <ExpenseList
                        transactions={expenseData}

                        onDelete={(id) =>
                            setOpenDeleteAlert({
                                show: true,
                                data: id,
                            })
                        }

                        onDownload={
                            handleDownloadExpenseDetails
                        }

                        onEmail={
                            handleEmailExpenseDetails
                        }
                    />

                    {/* Add Expense Modal */}
                    <Modal
                        isOpen={openAddExpenseModal}
                        onClose={() =>
                            setOpenAddExpenseModal(false)
                        }
                        title="Add Expense"
                    >
                        <AddExpenseForm
                            onAddExpense={
                                handleAddExpense
                            }
                            categories={categories}
                        />
                    </Modal>

                    {/* Delete Expense Modal */}
                    <Modal
                        isOpen={openDeleteAlert.show}
                        onClose={() =>
                            setOpenDeleteAlert({
                                show: false,
                                data: null,
                            })
                        }
                        title="Delete Expense"
                    >
                        <DeleteAlert
                            content="Are you sure you want to delete this expense detail?"
                            onDelete={() =>
                                deleteExpense(
                                    openDeleteAlert.data
                                )
                            }
                        />
                    </Modal>

                </div>

            </div>

        </Dashboard>
    );
};

export default Expense;