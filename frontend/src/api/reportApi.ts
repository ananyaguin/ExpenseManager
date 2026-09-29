import apiClient from "./axios";

export const reportApi = {
  downloadExpenseExcel: async (): Promise<void> => {
    const response = await apiClient.get("/excel/download/expense", {
      responseType: "blob",
    });
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expense-report.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadIncomeExcel: async (): Promise<void> => {
    const response = await apiClient.get("/excel/download/income", {
      responseType: "blob",
    });
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "income-report.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  emailExpenseExcel: async (): Promise<void> => {
    await apiClient.get("/email/expense-excel");
  },

  emailIncomeExcel: async (): Promise<void> => {
    await apiClient.get("/email/income-excel");
  },
};
