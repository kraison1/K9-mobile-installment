import React from "react";
import { usePagination, DOTS } from "src/components/paginationOption";
import { formatNumberDigit } from "src/helpers/formatNumber";

const PageNavigation = (props) => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
  } = props;
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const lastPage = paginationRange[paginationRange.length - 1];

  return (
    <nav className="flex items-center flex-column flex-wrap lg:flex-row justify-between">
      <span className="text-sm font-normal text-gray-500 mb-4 lg:mb-0 block w-full lg:inline lg:w-auto">
        {`แสดง `}
        <span className="font-bold text-blue-500">
          {formatNumberDigit((currentPage - 1) * pageSize + 1)}
        </span>
        {` ถึง `}
        <span className="font-bold text-blue-500">
          {formatNumberDigit(
            currentPage * pageSize > totalCount
              ? totalCount
              : (currentPage - 1) * pageSize + pageSize
          )}
        </span>
        {` จาก `}
        <span className="font-bold text-red-500">
          {formatNumberDigit(totalCount)}
        </span>
        {` รายการ `}
      </span>

      <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
        {currentPage === 1 ? null : (
          <li>
            <button
              className="block py-1.5 px-3 border-0 bg-transparent outline-none
              transition-all duration-300 rounded
              text-gray-800 hover:text-gray-800
              hover:bg-gray-300 focus:shadow-none"
              aria-label="Previous"
              onClick={() => onPageChange(currentPage - 1)}
            >
              <span aria-hidden="true">&lt;</span>
            </button>
          </li>
        )}

        {paginationRange.map((pageNumber, i) => {
          if (pageNumber === DOTS) {
            return (
              <li className="pagination-item dots" key={i}>
                &#8230;
              </li>
            );
          }

          return (
            <li
              style={{
                marginLeft: 1,
                marginRight: 1,
              }}
              key={i}
            >
              <button
                className={`block py-1.5 px-3 border-0 outline-none
                      transition-all duration-300 rounded text-gray-800 hover:text-gray-800
                    hover:bg-blue-400 focus:shadow-none ${
                      currentPage === pageNumber ? "bg-blue-300" : ""
                    }`}
                onClick={() => onPageChange(pageNumber)}
              >
                {formatNumberDigit(pageNumber)}
              </button>
            </li>
          );
        })}
        {currentPage === lastPage ? null : (
          <li>
            <button
              disabled={currentPage === lastPage ? true : false}
              className="block py-1.5 px-3 border-0 bg-transparent outline-none
                            transition-all duration-300 rounded text-gray-800 hover:text-gray-800
                            hover:bg-gray-300 focus:shadow-none"
              aria-label="Next"
              onClick={() => onPageChange(currentPage + 1)}
            >
              <span aria-hidden="true"> &gt;</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default PageNavigation;
