import numeral from 'numeral';

const formatNumber = (item: number, decimals: number) => {
  const value = Number(item) ?? 0;
  const parsedNumber = parseFloat(value.toString().replace(/,/g, ''));
  return parsedNumber.toLocaleString('th-TH', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

const formatNumberDigit = (item: number) => formatNumber(item, 0);
const formatNumberDigit2 = (item: number) => formatNumber(item, 2);
const formatNumberDigit3 = (item: number) => formatNumber(item, 3);

const abbreviateNumber = (num) => {
  const parsedNumber = parseFloat(num ?? 0);
  return numeral(parsedNumber).format('0.[0]a');
};

export {
  formatNumberDigit,
  formatNumberDigit2,
  formatNumberDigit3,
  abbreviateNumber,
};
