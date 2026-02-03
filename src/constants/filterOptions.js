export const categoryOptions = [
  { value: "books", label: "Books" },
  { value: "stationary", label: "Stationary" },
  { value: "electronics", label: "Electronics" },
  { value: "others", label: "Others" },
];

export const branchOptions = [
  { value: "CME", label: "CME (Computer Science)" },
  { value: "CE", label: "CE (Civil)" },
  { value: "M", label: "M (Mechanical)" },
  { value: "ECE", label: "ECE" },
  { value: "EEE", label: "EEE" },
  { value: "CIOT", label: "CIOT" },
  { value: "AIML", label: "AIML" },
];

export const priceRangeOptions = [
  { value: "all", label: "All Prices", min: 0, max: Infinity },
  { value: "0", label: "₹0 (Free)", min: 0, max: 0 },
  { value: "1-100", label: "₹1 - ₹100", min: 1, max: 100 },
  { value: "100-500", label: "₹100 - ₹500", min: 100, max: 500 },
  { value: "500-1000", label: "₹500 - ₹1000", min: 500, max: 1000 },
  { value: "1000-5000", label: "₹1000 - ₹5000", min: 1000, max: 5000 },
  { value: "5000+", label: "₹5000+", min: 5000, max: Infinity },
];
