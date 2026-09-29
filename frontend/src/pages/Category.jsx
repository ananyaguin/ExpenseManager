import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";
import { Plus } from "lucide-react";
import CategoryList from "../components/CategoryList.jsx";
import { useEffect, useState } from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import AddCategoryForm from "../components/AddCategoryForm.jsx";

const Category = () => {
    useUser();

    const [categoryData, setCategoryData] = useState([]);

    const [openAddCategoryModal, setOpenAddCategoryModal] =
        useState(false);

    const [openEditCategoryModal, setOpenEditCategoryModal] =
        useState(false);

    const [selectedCategory, setSelectedCategory] =
        useState(null);

    // ==============================
    // FETCH CATEGORY DETAILS
    // ==============================
    const fetchCategoryDetails = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.GET_ALL_CATEGORIES
            );

            if (response.status === 200) {
                console.log("categories", response.data);
                setCategoryData(response.data);
            }
        } catch (error) {
            console.error(
                "Something went wrong. Please try again.",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch categories."
            );
        }
    };

    // ==============================
    // LOAD CATEGORIES WHEN PAGE OPENS
    // ==============================
    useEffect(() => {
        let cancelled = false;

        const loadCategories = async () => {
            try {
                const response = await axiosConfig.get(
                    API_ENDPOINTS.GET_ALL_CATEGORIES
                );

                if (cancelled) return;

                if (response.status === 200) {
                    console.log("categories", response.data);
                    setCategoryData(response.data);
                }
            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Something went wrong. Please try again.",
                    error
                );

                toast.error(
                    error.response?.data?.message ||
                    "Failed to fetch categories."
                );
            }
        };

        loadCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    // ==============================
    // ADD CATEGORY
    // ==============================
    const handleAddCategory = async (category) => {
        const { name, type, icon } = category;

        if (!name?.trim()) {
            toast.error("Category Name is required");
            return;
        }

        // Check duplicate category
        const isDuplicate = categoryData.some(
            (category) =>
                category.name.toLowerCase() ===
                name.trim().toLowerCase()
        );

        if (isDuplicate) {
            toast.error("Category Name already exists");
            return;
        }

        try {
            const response = await axiosConfig.post(
                API_ENDPOINTS.ADD_CATEGORY,
                {
                    name,
                    type,
                    icon,
                }
            );

            if (response.status === 201) {
                toast.success(
                    "Category added successfully"
                );

                setOpenAddCategoryModal(false);

                // Refresh categories
                fetchCategoryDetails();
            }
        } catch (error) {
            console.error(
                "Error adding category:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to add category."
            );
        }
    };

    // ==============================
    // EDIT CATEGORY
    // ==============================
    const handleEditCategory = (categoryToEdit) => {
        setSelectedCategory(categoryToEdit);
        setOpenEditCategoryModal(true);
    };

    // ==============================
    // UPDATE CATEGORY
    // ==============================
    const handleUpdateCategory = async (
        updatedCategory
    ) => {
        const {
            id,
            name,
            type,
            icon,
        } = updatedCategory;

        if (!name?.trim()) {
            toast.error("Category Name is required");
            return;
        }

        if (!id) {
            toast.error(
                "Category ID is missing for update"
            );
            return;
        }

        try {
            await axiosConfig.put(
                API_ENDPOINTS.UPDATE_CATEGORY(id),
                {
                    name,
                    type,
                    icon,
                }
            );

            setOpenEditCategoryModal(false);
            setSelectedCategory(null);

            toast.success(
                "Category updated successfully"
            );

            // Refresh categories
            fetchCategoryDetails();

        } catch (error) {
            console.error(
                "Error updating category:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update category."
            );
        }
    };

    // ==============================
    // UI
    // ==============================
    return (
        <Dashboard activeMenu="Category">

            <div className="my-5 mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-5">

                    <h2 className="text-2xl font-semibold">
                        All Categories
                    </h2>

                    <button
                        onClick={() =>
                            setOpenAddCategoryModal(true)
                        }
                        className="add-btn flex items-center gap-1"
                    >
                        <Plus size={15} />
                        Add Category
                    </button>

                </div>

                {/* Category List */}
                <CategoryList
                    categories={categoryData}
                    onEditCategory={
                        handleEditCategory
                    }
                />

                {/* Add Category Modal */}
                <Modal
                    isOpen={openAddCategoryModal}
                    onClose={() =>
                        setOpenAddCategoryModal(false)
                    }
                    title="Add Category"
                >
                    <AddCategoryForm
                        onAddCategory={
                            handleAddCategory
                        }
                    />
                </Modal>

                {/* Update Category Modal */}
                <Modal
                    isOpen={openEditCategoryModal}
                    onClose={() => {
                        setOpenEditCategoryModal(false);
                        setSelectedCategory(null);
                    }}
                    title="Update Category"
                >
                    <AddCategoryForm
                        initialCategoryData={
                            selectedCategory
                        }
                        onAddCategory={
                            handleUpdateCategory
                        }
                        isEditing={true}
                    />
                </Modal>

            </div>

        </Dashboard>
    );
};

export default Category;