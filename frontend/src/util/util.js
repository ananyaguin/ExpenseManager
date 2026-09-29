import moment from "moment";

export const addThousandsSeparator = (num) => {
    if (num == null || isNaN(num)) return "";

    const numStr = num.toString();
    const parts = numStr.split(".");

    let integerPart = parts[0];
    let fractionalPart = parts[1];

    const lastThree = integerPart.substring(
        integerPart.length - 3
    );

    const otherNumbers = integerPart.substring(
        0,
        integerPart.length - 3
    );

    if (otherNumbers !== "") {
        const formattedOtherNumbers =
            otherNumbers.replace(
                /\B(?=(\d{2})+(?!\d))/g,
                ","
            );

        integerPart =
            formattedOtherNumbers + "," + lastThree;
    } else {
        integerPart = lastThree;
    }

    return fractionalPart
        ? `${integerPart}.${fractionalPart}`
        : integerPart;
};


// =====================================
// INCOME LINE CHART DATA
// =====================================

export const prepareIncomeLineChartData = (data = []) => {

    const groupedByDate = data.reduce(
        (acc, item) => {

            const dateKey = item.date;

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: dateKey,
                    totalAmount: 0,
                    items: [],
                };
            }

            acc[dateKey].totalAmount += Number(
                item.amount || 0
            );

            acc[dateKey].items.push(item);

            return acc;
        },
        {}
    );

    let chartData = Object.values(
        groupedByDate
    );

    chartData.sort(
        (a, b) =>
            new Date(a.date) -
            new Date(b.date)
    );

    chartData = chartData.map(
        (dataPoint) => ({
            ...dataPoint,
            month: moment(
                dataPoint.date
            ).format("Do MMM"),
        })
    );

    return chartData;
};


// =====================================
// EXPENSE LINE CHART DATA
// =====================================

export const prepareExpenseLineChartData = (data = []) => {

    const groupedByDate = data.reduce(
        (acc, item) => {

            const dateKey = item.date;

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: dateKey,
                    totalAmount: 0,
                    items: [],
                };
            }

            acc[dateKey].totalAmount += Number(
                item.amount || 0
            );

            acc[dateKey].items.push(item);

            return acc;
        },
        {}
    );

    let chartData = Object.values(
        groupedByDate
    );

    chartData.sort(
        (a, b) =>
            new Date(a.date) -
            new Date(b.date)
    );

    chartData = chartData.map(
        (dataPoint) => ({
            ...dataPoint,
            month: moment(
                dataPoint.date
            ).format("Do MMM"),
        })
    );

    return chartData;
};