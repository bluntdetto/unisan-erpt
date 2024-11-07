export const upperFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const generateOriginalReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}${month}${day}${Math.floor(Math.random() * 1000000)}`;
}
