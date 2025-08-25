export const formatPrice = (cents: number, locale="th-TH", currency="THB") =>
  (cents/100).toLocaleString(locale, { style: "currency", currency });
