const productPrices = () => {
  let numbers = [];
  for (let i = 0; i <= 1000; i += 50) {
    numbers.push({
      label: i,
      value: i,
    });
  }
  return numbers;
};

export { productPrices };
