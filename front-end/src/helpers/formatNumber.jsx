import numeral from "numeral";

const formatNumber = (item, decimals) => {
  const value = item ?? 0;
  const parsedNumber = parseFloat(value.toString().replace(/,/g, ""));
  return parsedNumber.toLocaleString("th-TH", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

const formatNumberDigit = (item) => formatNumber(item, 0);
const formatNumberDigit2 = (item) => formatNumber(item, 2);
const formatNumberDigit3 = (item) => formatNumber(item, 3);

const abbreviateNumber = (num) => {
  const parsedNumber = parseFloat(num ?? 0);
  return numeral(parsedNumber).format("0.[0]a");
};

const calculateTotalSums = (data) => {
  let totalCash = 0;
  let totalTransfer = 0;

  data.forEach((item) => {
    totalCash += parseFloat(item.sumCash) || 0;
    totalTransfer += parseFloat(item.sumTransfer) || 0;
  });

  return {
    totalCash: formatNumberDigit2(totalCash),
    totalTransfer: formatNumberDigit2(totalTransfer),
  };
};

export {
  formatNumberDigit,
  formatNumberDigit2,
  formatNumberDigit3,
  abbreviateNumber,
  calculateTotalSums,
};
