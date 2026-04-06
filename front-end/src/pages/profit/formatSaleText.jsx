import { formatNumberDigit } from "src/helpers/formatNumber";

// Utility to get payment type label and color
const getPaymentTypeInfo = (payType) => {
  switch (payType) {
    case "1":
      return {
        label: "เงินสด",
        color: "bg-green-100 text-green-800",
      };
    case "2":
      return {
        label: "โอน",
        color: "bg-blue-100 text-blue-800",
      };
    case "3":
      return {
        label: "เงินสด+โอน",
        color: "bg-purple-100 text-purple-800",
      };
    default:
      return {
        label: "ไม่ระบุ",
        color: "bg-gray-100 text-gray-800",
      };
  }
};

export { getPaymentTypeInfo };
