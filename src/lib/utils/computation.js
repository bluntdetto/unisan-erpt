const BASIC_TAX_RATE = 0.01;
const SEF_TAX_RATE = 0.01;
const DISCOUNT_RATE = 0.2;
const QUARTER_DISCOUNT_RATE = 0.1;
const INTEREST_RATE = 0.02;

// Function to compute advance payment discount (Case 2)
const computeAdvanceDiscount = (assessedValue) => {
  const basicQuarterTax = assessedValue * BASIC_TAX_RATE;
  const sefTax = assessedValue * SEF_TAX_RATE;
  const discount = basicQuarterTax * DISCOUNT_RATE;
  const subTotal = basicQuarterTax + sefTax;
  const total = basicQuarterTax - discount + (sefTax - discount);

  return {
    basicQuarterTax,
    sefTax,
    discount: discount * 2,
    subTotal,
    total,
  };
};

// Function to compute prompt payment discount for the quarter (Case 3)
const computeQuarterDiscount = (assessedValue) => {
  const basicQuarterTax = (assessedValue * BASIC_TAX_RATE) / 4;
  const sefTax = (assessedValue * SEF_TAX_RATE) / 4;
  const discount = basicQuarterTax * QUARTER_DISCOUNT_RATE;
  const subTotal = basicQuarterTax + sefTax;
  const total = basicQuarterTax - discount + (sefTax - discount);

  return {
    basicQuarterTax,
    sefTax,
    discount: discount * 2,
    subTotal,
    total,
  };
};

const computeQuaterDiscountNoSef = (assessedValue) => {
  const basicQuarterTax = (assessedValue * BASIC_TAX_RATE) / 4;
  const discount = basicQuarterTax * QUARTER_DISCOUNT_RATE;
  const total = basicQuarterTax - discount;

  return {
    basicQuarterTax,
    discount,
    total,
  };
};

// Function to compute interest for late payment (Case 4 & 5)
const computeInterest = (assessedValue, monthsDelinquent) => {
  const basicQuarterTax = (assessedValue * BASIC_TAX_RATE) / 4;
  return basicQuarterTax * (INTEREST_RATE * monthsDelinquent);
};

// Function to compute late payment tax (Case 4)
const computeLatePaymentTax = (assessedValue, monthsDelinquent) => {
  const delinquentMonths = monthsDelinquent > 36 ? 36 : monthsDelinquent;
  const interest = computeInterest(assessedValue, delinquentMonths);
  const interestTotal = interest * 2;
  const basicQuarterTax = (assessedValue * BASIC_TAX_RATE) / 4;
  const basicQuarterTaxSub = basicQuarterTax * 2;
  const basicTaxWithInterest = basicQuarterTax + interest;
  const total = basicTaxWithInterest * 2;

  return {
    basicQuarterTax,
    subTotal: basicQuarterTaxSub,
    discount: 0,
    interest: interestTotal,
    total,
  };
};

// Function to compute multiple quarters of late payment tax (Case 5)
const computeMultipleLatePaymentTax = (assessedValue, monthsDelinquent) =>
  monthsDelinquent.reduce(
    (acc, month) => {
      const quarterTax = computeLatePaymentTax(assessedValue, month);

      // Accumulate values from each delinquent month
      acc.basicQuarterTax += quarterTax.basicQuarterTax;
      acc.sefQuarterTax += quarterTax.sefQuarterTax;
      acc.interest += quarterTax.interest;
      acc.subtotal += quarterTax.subtotal;
      acc.total += quarterTax.total;

      return acc;
    },
    {
      basicQuarterTax: 0,
      sefQuarterTax: 0,
      interest: 0,
      subtotal: 0,
      total: 0,
    }
  );

export const computeTax = (assessedValue, lastPaymentDate) => {
  if (!lastPaymentDate) return computeQuarterDiscount(assessedValue);

  const currentDate = new Date();
  const monthsDelinquent =
    (currentDate.getFullYear() - lastPaymentDate.getFullYear()) * 12 +
    currentDate.getMonth() -
    lastPaymentDate.getMonth();

  if (monthsDelinquent < 0) return computeAdvanceDiscount(assessedValue);

  if (monthsDelinquent === 0) return computeQuarterDiscount(assessedValue);

  if (monthsDelinquent === 1)
    return computeLatePaymentTax(assessedValue, monthsDelinquent);

  return computeMultipleLatePaymentTax(assessedValue, monthsDelinquent);
};

export {
  computeAdvanceDiscount,
  computeQuarterDiscount,
  computeLatePaymentTax,
  computeMultipleLatePaymentTax,
  computeQuaterDiscountNoSef,
};
