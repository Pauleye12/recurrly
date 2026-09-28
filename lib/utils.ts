import dayjs from "dayjs";

/**
 * Formats a numeric value or numeric string to Nigerian Naira (₦) with 2 decimal places.
 *
 * @param value - The value to format (number or numeric string).
 * @returns The formatted Naira currency string (e.g. "₦2,489.48").
 */
export function formatToNaira(value: number | string): string {
  const numericValue = typeof value === "string" ? Number(value) : value;

  if (
    numericValue === undefined ||
    numericValue === null ||
    isNaN(numericValue)
  ) {
    return "₦0.00";
  }

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    const isNegative = numericValue < 0;
    const absValue = Math.abs(numericValue);
    const [intPart, decPart] = absValue.toFixed(2).split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${isNegative ? "-" : ""}₦${formattedInt}.${decPart}`;
  }
}

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatCurrency = formatToNaira;
