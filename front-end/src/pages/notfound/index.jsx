import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiLogOut } from "react-icons/fi";
import { useAuth } from "src/hooks/authContext";
import { isEmpty } from "lodash";

const NotFoundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setTimeout(() => {
      navigate(`/login`, { replace: true });
    }, 50);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* ภาพประกอบหรือไอคอนขนาดใหญ่ */}
        <div className="text-6xl text-red-500 mb-6 animate-pulse">404</div>

        {/* ข้อความหลัก */}
        <h4 className="text-md font-bold text-gray-800 mb-4 text-center">
          ดูเหมือนว่าคุณหลงทางแล้ว! หน้าที่คุณค้นหาไม่มีอยู่
        </h4>

        {/* กล่องปุ่ม */}
        <div className="flex flex-col gap-2 w-full">
          {/* ปุ่มกลับหน้าหลัก */}
          <NavLink
            to={`${import.meta.env.VITE_APP_BASE_NAME}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <FiHome className="text-lg" />
            กลับสู่หน้าหลัก
          </NavLink>

          {/* ปุ่มออกจากระบบ */}
          {!isEmpty(user) ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 text-red-600 hover:text-red-800 transition-colors duration-300"
            >
              <FiLogOut className="text-lg" />
              ออกจากระบบ
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
