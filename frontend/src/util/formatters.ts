export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount == null || amount === "" || isNaN(Number(amount))) return "₹0";

  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const [intPart, decPart] = absNum.toFixed(2).split(".");

  let lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);

  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

  const result = decPart && decPart !== "00"
    ? `₹${formattedInt}.${decPart}`
    : `₹${formattedInt}`;

  return isNegative ? `-${result}` : result;
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
};
