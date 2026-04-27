export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);

export const formatRatio = (value: number | null): string => {
  if (value === null) return "不可计算";
  return `${(value * 100).toFixed(1)}%`;
};
