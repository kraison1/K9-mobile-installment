import React from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { isEmpty } from "lodash";

import AuthLayout from "src/layouts/authLayout";
import UnauthLayout from "src/layouts/unauthLayout";
import { useAuth } from "src/hooks/authContext";
import ModalLoadging from "src/components/modalLoading";
import ModalInternet from "src/components/modalInternet";

// ✅ helper: permission check ได้ทั้ง id + legacyIds
const hasPermission = (permissions = [], id, legacyIds = []) => {
  if (!id) return true;
  const keys = [id, ...(legacyIds || [])].filter(Boolean);
  return keys.some((k) => permissions.includes(k));
};

const ProtectedRoute = ({
  id,
  legacyIds = [], // ✅ default parameter แทน defaultProps
  element: Component,
  auth = true, // ✅ default parameter แทน defaultProps
  ...rest
}) => {
  const { user, permissions } = useAuth();
  const location = useLocation();

  const isAuthenticated = !isEmpty(user);
  const Layout = auth ? AuthLayout : UnauthLayout;

  // 1) ต้อง login แต่ยังไม่ login -> เด้ง login ทันที
  if (auth && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // 2) login แล้ว แต่ permissions ยังไม่พร้อม (กำลังโหลด)
  // (ของคุณ permissions default = [] อยู่แล้ว แทบไม่เข้าเงื่อนไขนี้ แต่เผื่อไว้)
  if (auth && isAuthenticated && permissions == null) {
    return (
      <Layout>
        <ModalInternet />
        <ModalLoadging />
        <div className="p-4 text-gray-500">Loading permissions...</div>
      </Layout>
    );
  }

  // 3) เช็คสิทธิ์
  if (auth && isAuthenticated) {
    if (isEmpty(permissions)) {
      // ถ้า permissions ว่าง = ถือว่า session ไม่สมบูรณ์ -> เด้ง login
      return (
        <Navigate
          to="/login"
          replace
          state={{ from: location.pathname + location.search }}
        />
      );
    }

    if (!hasPermission(permissions, id, legacyIds)) {
      return <Navigate to="*" replace />;
    }
  }

  return (
    <Layout>
      <ModalInternet />
      <ModalLoadging />
      <Component {...rest} />
    </Layout>
  );
};

ProtectedRoute.propTypes = {
  id: PropTypes.string,
  legacyIds: PropTypes.array,
  element: PropTypes.elementType.isRequired,
  auth: PropTypes.bool,
};

export default ProtectedRoute;
