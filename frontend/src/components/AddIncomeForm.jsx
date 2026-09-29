import { useState } from "react";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
import Input from "./Input.jsx";
import { LoaderCircle } from "lucide-react";

const AddIncomeForm = ({ onAddIncome, categories }) => {
    const [income, setIncome] = useState({
        name: "",
        amount: "",
        date: "",
        icon: "",
        categoryId: ""
    });

    const [loading, setLoading] = useState(false);

    const categoryOptions = categories.map((category) => ({
        value: category.id,
        label: category.name
    }));

    const selectedCategoryId =
        income.categoryId || categories[0]?.id || "";

    const handleChange = (key, value) => {
        setIncome((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleAddIncome = async () => {
        setLoading(true);

        try {
            await onAddIncome({
                ...income,
                categoryId: selectedCategoryId
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <EmojiPickerPopup
                icon={income.icon}
                onSelect={(selectedIcon) =>
                    handleChange("icon", selectedIcon)
                }
            />

            <Input
                value={income.name}
                onChange={({ target }) =>
                    handleChange("name", target.value)
                }
                label="Income Source"
                placeholder="e.g., Salary, Freelance, Bonus"
                type="text"
            />

            <Input
                label="Category"
                value={selectedCategoryId}
                onChange={({ target }) =>
                    handleChange("categoryId", target.value)
                }
                isSelect={true}
                options={categoryOptions}
            />

            <Input
                value={income.amount}
                onChange={({ target }) =>
                    handleChange("amount", target.value)
                }
                label="Amount"
                placeholder="e.g., 500.00"
                type="number"
            />

            <Input
                value={income.date}
                onChange={({ target }) =>
                    handleChange("date", target.value)
                }
                label="Date"
                placeholder=""
                type="date"
            />

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleAddIncome}
                    disabled={loading}
                    className="add-btn add-btn-fill"
                >
                    {loading ? (
                        <>
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        <>
                            Add Income
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AddIncomeForm;