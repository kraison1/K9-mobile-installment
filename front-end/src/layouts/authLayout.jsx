import React from "react";
import PropTypes from "prop-types";
import SideBar from "src/layouts/sideBar";
import BreadCrumb from "src/layouts/breadcrumb";
import { MdAccountCircle } from "react-icons/md";
import { useAuth } from "src/hooks/authContext";
import { isEmpty } from "lodash";

const AuthLayout = ({ children }) => {
  const dropdownRef = React.useRef(null);

  const { user, logout } = useAuth();
  const [IsSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [DropDown, setDropDown] = React.useState(false);

  return (
    !isEmpty(user) && (
      <div className="flex bg-gray-200 max-h-[100vh]">
        <SideBar open={IsSidebarOpen} />

        {/* Main content */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between h-16 bg-gray-300 border-b border-gray-300 shadow-sm">
            <div className="flex items-center px-4">
              <button
                className="text-gray-500 hover:text-white"
                onClick={() => setIsSidebarOpen(!IsSidebarOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
            <div className="relative flex items-center pr-4" ref={dropdownRef}>
              <button
                className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                onClick={() => setDropDown(!DropDown)}
              >
                <span className="mr-2 hidden lg:block">{user.name}</span>
                <MdAccountCircle size={30} className="text-green-600" />
              </button>
              <div
                className="flex-none"
                onMouseLeave={() => setDropDown(false)}
              >
                <div
                  className={`z-10 ${
                    DropDown ? "block" : "hidden"
                  } absolute right-5 mt-5 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-60`}
                >
                  <ul className="p-2 text-sm text-gray-700">
                    <li>ชื่อผู้ใช้งาน: {user.username}</li>
                    <li>ตำแหน่ง: {user.userGroup?.name}</li>
                    <li>
                      สาขา: {`${user.branch?.name} (${user.branch?.code})`}
                    </li>
                  </ul>

                  <div className="text-center grid grid-cols grid-cols-1">
                    <button
                      className="py-2 text-sm text-red-500 border border-red-500 hover:bg-red-100 m-1 p-1"
                      onClick={() => logout()}
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto p-2">
            <div className="my-2 mx-2">
              <BreadCrumb />
            </div>
            {children}
          </div>
        </div>
      </div>
    )
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthLayout;
