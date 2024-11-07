export const paymentNotification = (
    status,
    taxDec,
    quarter,
    amount,
    dueDate
) => {
    const quarters = [ "1st", "2nd", "3rd", "4th" ];
    const periodCovered = typeof quarter === "number" ? quarters[quarter - 1] : quarter;

    const mapping = {
        due: `Payment Reminder: The payment of ₱${ amount } is due for ${ taxDec } for the ${ periodCovered } quarter. 
        Please ensure the payment is made before ${ dueDate } to avoid penalties.`,
        late: `Late Payment: The payment of ₱${ amount } for ${ taxDec } for the ${ periodCovered } quarter is overdue. Please make the payment as soon as possible to avoid further penalties.`,
        confirmed: `Online Payment Successful: Your payment of ₱${ amount } for ${ taxDec } for the ${ periodCovered } has been successfully processed. Thank you!`
    };

    return mapping[status];
};
