const toNum = (v) => Math.max(0, Number(v ?? 0));
const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

// คำนวณยอดทวงถาม/จ่ายค่าทวงถามแล้ว ต่อใบขาย
export const computeDebtView = (sale) => {
  const rows = (sale.productPayMentLists ?? []).map((p) => {
    const price = toNum(p.price);
    const pricePay = toNum(p.pricePay);
    const priceDebt = toNum(p.priceDebt);

    // ส่วนที่จ่ายไปให้ "ค่าทวงถาม" = เงินที่จ่ายเกินค่างวดปกติ แต่ไม่เกินยอดค่าทวงถามจริง
    const paidDebt = clamp(pricePay - price, 0, priceDebt);
    const unpaidDebt = Math.max(0, priceDebt - paidDebt);

    return {
      ...p,
      _price: price,
      _pricePay: pricePay,
      _priceDebt: priceDebt,
      _paidDebt: paidDebt,
      _unpaidDebt: unpaidDebt,
    };
  });

  // แถวที่เกี่ยวกับค่าทวงถามเท่านั้น
  const debtRows = rows.filter((r) => r._priceDebt > 0 || r._paidDebt > 0);

  const totalDebt = debtRows.reduce((s, r) => s + r._priceDebt, 0);
  const totalDebtPaid = debtRows.reduce((s, r) => s + r._paidDebt, 0);
  const totalDebtUnpaid = Math.max(0, totalDebt - totalDebtPaid);

  return { debtRows, totals: { totalDebt, totalDebtPaid, totalDebtUnpaid } };
};
