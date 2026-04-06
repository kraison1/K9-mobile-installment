import React from "react";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { getPaymentTypeInfo } from "./formatSaleText";
import { useDispatch, useSelector } from "react-redux";

const renderSaleSection = (
  entries,
  title,
  isCancelled,
  isAccessible = false,
  type = null
) => {
  if (!entries.length) {
    return (
      <div className="mt-6">
        <h3
          className={`text-lg font-semibold ${
            isCancelled ? "text-red-600" : "text-gray-800"
          }`}
          {...(isAccessible ? { "aria-label": title } : {})}
        >
          {title}
        </h3>
        <p
          className="text-gray-500 italic mt-2"
          {...(isAccessible ? { "aria-label": "ไม่มีรายการ" } : {})}
        >
          (ไม่มีรายการ)
        </p>
      </div>
    );
  }

  const totalAmount = entries.reduce(
    (sum, item) =>
      sum + Number(item.sumCash || 0) + Number(item.sumTransfer || 0),
    0
  );
  const totalCount = entries.reduce((sum, item) => sum + Number(item.count), 0);

  return (
    <div className="mt-6">
      <h3
        className={`text-lg font-semibold ${
          isCancelled ? "text-red-600" : "text-gray-800"
        }`}
        {...(isAccessible ? { "aria-label": title } : {})}
      >
        {title}
      </h3>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto mt-3">
        <table
          className="w-full table-auto"
          {...(isAccessible
            ? { role: "grid", "aria-label": `${title} table` }
            : {})}
        >
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
              <th
                className="px-6 py-4 text-left font-semibold"
                {...(isAccessible
                  ? { scope: "col", "aria-label": "ประเภทการจ่าย" }
                  : {})}
              >
                ประเภทการจ่าย
              </th>
              <th
                className="px-6 py-4 text-left font-semibold"
                {...(isAccessible
                  ? { scope: "col", "aria-label": "ธนาคาร" }
                  : {})}
              >
                ธนาคาร
              </th>
              <th
                className="px-6 py-4 text-left font-semibold"
                {...(isAccessible
                  ? { scope: "col", "aria-label": "เลขที่บัญชี" }
                  : {})}
              >
                เลขที่บัญชี
              </th>
              <th
                className="px-6 py-4 text-left font-semibold"
                {...(isAccessible
                  ? { scope: "col", "aria-label": "ชื่อบัญชี" }
                  : {})}
              >
                ชื่อบัญชี
              </th>
              <th
                className="px-6 py-4 text-right font-semibold"
                {...(isAccessible
                  ? { scope: "col", "aria-label": "จำนวนรายการ" }
                  : {})}
              >
                จำนวนรายการ
              </th>
              <th
                className="px-6 py-4 text-right font-semibold"
                {...(isAccessible
                  ? { scope: "col", "aria-label": "ยอดรวม" }
                  : {})}
              >
                ยอดรวม
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((item, index) => {
              const { label, color } = getPaymentTypeInfo(item.payType);
              const total =
                Number(item.sumCash || 0) + Number(item.sumTransfer || 0);
              const cash = Number(item.sumCash || 0);
              const transfer = Number(item.sumTransfer || 0);
              const cashColor = getPaymentTypeInfo("1").color;
              const transferColor = getPaymentTypeInfo("2").color;
              return (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  {...(isAccessible ? { role: "row" } : {})}
                >
                  <td
                    className="px-6 py-4"
                    {...(isAccessible
                      ? {
                          role: "cell",
                          "aria-label": `ประเภทการจ่าย: ${label}`,
                        }
                      : {})}
                  >
                    {type == null ? (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}
                      >
                        {label}
                      </span>
                    ) : (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}
                      >
                        {label}
                      </span>
                    )}
                  </td>
                  <td
                    className="px-6 py-4 text-gray-700"
                    {...(isAccessible
                      ? {
                          role: "cell",
                          "aria-label": `ธนาคาร: ${item.bankName || "ไม่ระบุ"}`,
                        }
                      : {})}
                  >
                    {item.bankName || "-"}
                  </td>
                  <td
                    className="px-6 py-4 text-gray-700"
                    {...(isAccessible
                      ? {
                          role: "cell",
                          "aria-label": `เลขที่บัญชี: ${
                            item.bankNo || "ไม่ระบุ"
                          }`,
                        }
                      : {})}
                  >
                    {item.bankNo || "-"}
                  </td>
                  <td
                    className="px-6 py-4 text-gray-700"
                    {...(isAccessible
                      ? {
                          role: "cell",
                          "aria-label": `ชื่อบัญชี: ${
                            item.bankOwner || "ไม่ระบุ"
                          }`,
                        }
                      : {})}
                  >
                    {item.bankOwner || "-"}
                  </td>
                  <td
                    className="px-6 py-4 text-right text-gray-700"
                    {...(isAccessible
                      ? {
                          role: "cell",
                          "aria-label": `จำนวนรายการ: ${item.count}`,
                        }
                      : {})}
                  >
                    {formatNumberDigit(item.count)}
                  </td>
                  <td
                    className="px-6 py-4 text-right text-gray-700"
                    {...(isAccessible
                      ? {
                          role: "cell",
                          "aria-label": `ยอดรวม: ${
                            item.payType === "3"
                              ? `เงินสด ${formatNumberDigit(
                                  cash
                                )} บ., โอน ${formatNumberDigit(
                                  transfer
                                )} บ., รวม ${formatNumberDigit(total)} บ.`
                              : `${formatNumberDigit(total)} บ.`
                          }`,
                        }
                      : {})}
                  >
                    {item.payType === "3" ? (
                      <div>
                        <p className={`${transferColor}`}>
                          โอน: {formatNumberDigit(transfer)}
                        </p>
                        <p className={`${cashColor}`}>
                          เงินสด: {formatNumberDigit(cash)}
                        </p>
                        <p className="font-semibold">
                          รวม: {formatNumberDigit(total)}
                        </p>
                      </div>
                    ) : (
                      `${formatNumberDigit(total)}`
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr
              className="bg-gray-100 text-gray-800 font-semibold"
              {...(isAccessible ? { role: "row", "aria-label": "สรุป" } : {})}
            >
              <td
                className="px-6 py-4 text-left"
                {...(isAccessible ? { role: "cell", "aria-label": "รวม" } : {})}
              >
                รวม
              </td>
              <td
                className="px-6 py-4"
                {...(isAccessible ? { role: "cell" } : {})}
              ></td>
              <td
                className="px-6 py-4"
                {...(isAccessible ? { role: "cell" } : {})}
              ></td>
              <td
                className="px-6 py-4"
                {...(isAccessible ? { role: "cell" } : {})}
              ></td>
              <td
                className="px-6 py-4 text-right"
                {...(isAccessible
                  ? {
                      role: "cell",
                      "aria-label": `จำนวนรายการรวม: ${totalCount}`,
                    }
                  : {})}
              >
                {formatNumberDigit(totalCount)}
              </td>
              <td
                className="px-6 py-4 text-right"
                {...(isAccessible
                  ? {
                      role: "cell",
                      "aria-label": `ยอดรวม: ${formatNumberDigit(
                        totalAmount
                      )} บ.`,
                    }
                  : {})}
              >
                {formatNumberDigit(totalAmount)} บ.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 mt-3">
        {entries.map((item, index) => {
          const { label, color } = getPaymentTypeInfo(item.payType);
          const total =
            Number(item.sumCash || 0) + Number(item.sumTransfer || 0);
          const cash = Number(item.sumCash || 0);
          const transfer = Number(item.sumTransfer || 0);
          const cashColor = getPaymentTypeInfo("1").color;
          const transferColor = getPaymentTypeInfo("2").color;
          return (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              {...(isAccessible
                ? { role: "article", "aria-label": `รายการ ${label}` }
                : {})}
            >
              <div className="flex justify-between items-center mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}
                  {...(isAccessible
                    ? { "aria-label": `ประเภทการจ่าย: ${label}` }
                    : {})}
                >
                  {label}
                </span>
                <span
                  className="text-sm text-gray-600"
                  {...(isAccessible
                    ? { "aria-label": `จำนวนรายการ: ${item.count}` }
                    : {})}
                >
                  {formatNumberDigit(item.count)} รายการ
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {item.bankName && (
                  <div>
                    <p
                      className="text-gray-500 font-medium"
                      {...(isAccessible ? { "aria-label": "ธนาคาร" } : {})}
                    >
                      ธนาคาร
                    </p>
                    <p
                      className="text-gray-700"
                      {...(isAccessible
                        ? { "aria-label": `ธนาคาร: ${item.bankName}` }
                        : {})}
                    >
                      {item.bankName}
                    </p>
                  </div>
                )}
                {item.bankNo && (
                  <div>
                    <p
                      className="text-gray-500 font-medium"
                      {...(isAccessible ? { "aria-label": "เลขที่บัญชี" } : {})}
                    >
                      เลขที่บัญชี
                    </p>
                    <p
                      className="text-gray-700"
                      {...(isAccessible
                        ? { "aria-label": `เลขที่บัญชี: ${item.bankNo}` }
                        : {})}
                    >
                      {item.bankNo}
                    </p>
                  </div>
                )}
                {item.bankOwner && (
                  <div>
                    <p
                      className="text-gray-500 font-medium"
                      {...(isAccessible ? { "aria-label": "ชื่อบัญชี" } : {})}
                    >
                      ชื่อบัญชี
                    </p>
                    <p
                      className="text-gray-700"
                      {...(isAccessible
                        ? { "aria-label": `ชื่อบัญชี: ${item.bankOwner}` }
                        : {})}
                    >
                      {item.bankOwner}
                    </p>
                  </div>
                )}
                <div>
                  <p
                    className="text-gray-500 font-medium"
                    {...(isAccessible ? { "aria-label": "ยอดรวม" } : {})}
                  >
                    ยอดรวม
                  </p>
                  {item.payType === "3" ? (
                    <div
                      {...(isAccessible
                        ? {
                            "aria-label": `ยอดรวม: เงินสด ${formatNumberDigit(
                              cash
                            )} บ., โอน ${formatNumberDigit(
                              transfer
                            )} บ., รวม ${formatNumberDigit(total)} บ.`,
                          }
                        : {})}
                    >
                      <p className={`${cashColor}`}>
                        เงินสด: {formatNumberDigit(cash)} บ.
                      </p>
                      <p className={`${transferColor}`}>
                        โอน: {formatNumberDigit(transfer)} บ.
                      </p>
                      <p className="font-semibold text-gray-700">
                        รวม: {formatNumberDigit(total)} บ.
                      </p>
                    </div>
                  ) : (
                    <p
                      className="text-gray-700"
                      {...(isAccessible
                        ? {
                            "aria-label": `ยอดรวม: ${formatNumberDigit(
                              total
                            )} บ.`,
                          }
                        : {})}
                    >
                      {formatNumberDigit(total)} บ.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {/* Mobile Summary Card */}
        <div
          className="bg-gray-100 rounded-xl p-4 shadow-sm mt-4"
          {...(isAccessible ? { role: "article", "aria-label": "สรุป" } : {})}
        >
          <h3
            className="text-lg font-semibold text-gray-800 mb-3"
            {...(isAccessible ? { "aria-label": "รวม" } : {})}
          >
            รวม
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p
                className="text-gray-500 font-medium"
                {...(isAccessible ? { "aria-label": "จำนวนรายการ" } : {})}
              >
                จำนวนรายการ
              </p>
              <p
                className="text-gray-700"
                {...(isAccessible
                  ? { "aria-label": `จำนวนรายการ: ${totalCount}` }
                  : {})}
              >
                {formatNumberDigit(totalCount)} รายการ
              </p>
            </div>
            <div>
              <p
                className="text-gray-500 font-medium"
                {...(isAccessible ? { "aria-label": "ยอดรวม" } : {})}
              >
                ยอดรวม
              </p>
              <p
                className="text-gray-700"
                {...(isAccessible
                  ? {
                      "aria-label": `ยอดรวม: ${formatNumberDigit(
                        totalAmount
                      )} บ.`,
                    }
                  : {})}
              >
                {formatNumberDigit(totalAmount)} บ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { renderSaleSection };
