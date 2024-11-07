const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${ year }-${ month }-${ day }`;
};

export const getQuarter = (date = new Date()) => {
    const month = date.getMonth();
    return Math.floor(month / 3) + 1;
};

export const getDateFromQuarter = (year, quarter) => {
    if (quarter === 5) {
        quarter = 1;
        year += 1;
    }

    const month = quarter * 3 - 1;
    return new Date(year, month);
};


export const getQuarterStart = (year, quarter) => {
    if (quarter === 5) {
        quarter = 1;
        year += 1;
    }

    const month = quarter * 3 - 3;
    return new Date(year, month);
};

export const quarterToString = (quarter) => {
    switch (quarter) {
        case 1:
            return "1st Quarter";
        case 2:
            return "2nd Quarter";
        case 3:
            return "3rd Quarter";
        case 4:
            return "4th Quarter";
        default:
            return "Annual";
    }
}

export { formatDate };
