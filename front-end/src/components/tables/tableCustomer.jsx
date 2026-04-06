import PropTypes from "prop-types";
import { isEmpty as _isEmpty } from "lodash";
import { formatNumberDigit } from "src/helpers/formatNumber";
import { noImage } from "src/helpers/constant";
import { conFirm } from "../alart";
import { useAuth as useAuthInside } from "src/hooks/authContext";
import { useDispatch as useDispatchInside } from "react-redux";
import { deleteCustomer } from "src/store/customer";

export const TableCustomerResponsive = ({
  tableHeaders,
  tableLists,
  onClick,
  page,
  pageSize,
}) => {
  const { permissions, setIsLoadingOpen } = useAuthInside();
  const dispatch = useDispatchInside();

  const onDelete = (item) => {
    conFirm(`ยืนยันการลบ ${item.code}`, "ตกลง", "ปิด", true).then((e) => {
      if (e.isConfirmed) {
        setIsLoadingOpen(true);
        dispatch(deleteCustomer(item))
          .unwrap()
          .then(() => setIsLoadingOpen(false))
          .catch(() => setIsLoadingOpen(false));
      }
    });
  };

  const formatAddress = (address, subdistrict, district, province, zipcode) => {
    const parts = [
      address,
      subdistrict?.name ? `ต.${subdistrict.name}` : null,
      district?.name ? `อ.${district.name}` : null,
      province?.name ? `จ.${province.name}` : null,
      zipcode,
    ];
    return parts.filter(Boolean).join(", ");
  };

  return (
    <div className="w-full">
      {/* TABLE for md+ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="rounded-sm text-left border border-collapse w-full">
          <thead className="text-gray-900">
            <tr className="bg-gray-100">
              {tableHeaders.map((h, k) => (
                <th
                  key={k}
                  className={`${_isEmpty(h.align) ? "" : h.align} border p-2 whitespace-nowrap`}
                  style={{ width: `${h.w}%` }}
                >
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableLists.map((row, k) => (
              <tr className="bg-white" key={k}>
                <td className="border p-2 font-light">
                  {formatNumberDigit((page - 1) * pageSize + k + 1)}
                </td>
                <td className="border p-2 font-light text-center">
                  <div className="flex justify-center items-center">
                    {noImage(row.fileCustomer)}
                  </div>
                  <p
                    className="text-blue-500 cursor-pointer"
                    onClick={() => onClick(row)}
                  >
                    {row.code}
                  </p>
                </td>
                {permissions.includes("can-deleted") ? (
                  <td
                    className="border p-2 font-light cursor-pointer text-blue-500"
                    onClick={() => onDelete(row)}
                  >
                    {`${row.name} ${row.lastname}`}
                  </td>
                ) : (
                  <td className="border p-2 font-light">{`${row.name} ${row.lastname}`}</td>
                )}
                <td className="border p-2 font-light">{row.tel}</td>
                <td className="border p-2 font-light">
                  <p className="max-w-[260px] truncate">
                    <a
                      href={row.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Facebook: {row?.facebook || "-"}
                    </a>
                  </p>
                  <p className="max-w-[260px] truncate">
                    <a
                      href={row.googleMap}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Google Map: {row?.googleMap || "-"}
                    </a>
                  </p>
                </td>
                <td className="border p-2 font-light">{`${row.nameRefOne}, ${row.relaRefOne}, ${row.telRefOne}`}</td>
                <td className="border p-2 font-light">{`${row.nameRefTwo}, ${row.relaRefTwo}, ${row.telRefTwo}`}</td>

                <td className="border p-2 font-light">
                  {formatAddress(row.address, row.mSubdistrict, row.mDistrict, row.mProvince, row.zipCode)}
                </td>
                <td className="border p-2 font-light">
                  {formatAddress(row.idCardAddress, row.idCardSubdistrict, row.idCardDistrict, row.idCardProvince, row.idCardZipCode)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CARDS for < md */}
      <div className="md:hidden space-y-3">
        {tableLists.map((row, k) => (
          <div key={k} className="border rounded-lg bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0">{noImage(row.fileCustomer)}</div>
                <div>
                  <button
                    className="text-blue-600 font-medium leading-tight"
                    onClick={() => onClick(row)}
                  >
                    {row.code}
                  </button>
                  <p className="text-sm text-gray-700">{`${row.name} ${row.lastname}`}</p>
                </div>
              </div>
              {permissions.includes("can-deleted") && (
                <button
                  onClick={() => onDelete(row)}
                  className="text-xs text-red-600 underline"
                >
                  ลบ
                </button>
              )}
            </div>

            <div className="mt-2 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">โทร</span>
                <span className="font-light">{row.tel}</span>
              </div>
              <div className="truncate">
                <a
                  href={row.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Facebook: {row?.facebook || "-"}
                </a>
              </div>
              <div className="truncate">
                <a
                  href={row.googleMap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google Map: {row?.googleMap || "-"}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 shrink-0">ผู้ติดต่อ</span>
                <span className="font-light truncate">{`${row.nameRefOne || "-"}, ${row.relaRefOne || "-"}, ${row.telRefOne || "-"}`}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 shrink-0">ที่อยู่</span>
                <span className="font-light">
                  {formatAddress(row.address, row.mSubdistrict, row.mDistrict, row.mProvince, row.zipCode)}
                </span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-gray-500">
              #{formatNumberDigit((page - 1) * pageSize + k + 1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

TableCustomerResponsive.propTypes = {
  tableHeaders: PropTypes.array,
  tableLists: PropTypes.array,
  onClick: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

// Export as default to replace original import path
export default TableCustomerResponsive;
