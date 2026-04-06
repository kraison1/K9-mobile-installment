import React from "react";
import PropTypes from "prop-types";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useLocation } from "react-router-dom";
import SidebarItem from "src/layouts/sideBarItem";
import { AllRouters } from "src/routers";
import { useAuth } from "src/hooks/authContext";
import { isEmpty } from "lodash";
import Thunder_logo from "src/styles/images/thunder_logo.png";

const normalize = (href = "") => {
  const base = String(href).split("?")[0];
  return base.endsWith("/*") ? base.slice(0, -2) : base;
};

const matchExact = (pathname, href) => {
  if (!href) return false;
  const h = normalize(href).toLowerCase();
  const p = String(pathname).toLowerCase();
  if (h === "/") return p === "/";
  return p === h;
};

const matchPrefix = (pathname, href) => {
  if (!href) return false;
  const h = normalize(href).toLowerCase();
  const p = String(pathname).toLowerCase();
  if (h === "/") return p === "/";
  return p === h || p.startsWith(h + "/");
};

const getAllowKeys = (menu) => {
  const keys = [menu?.id, ...(menu?.legacyIds || [])].filter(Boolean);
  return keys;
};

// ✅ leaf: ต้องมีสิทธิ์ตรง id หรือ legacy
// ✅ group: แสดงได้ถ้าตัวเองมีสิทธิ์ หรือมีลูกที่มีสิทธิ์
const isAllowed = (permissionIds, menu) => {
  const hasChildren = Array.isArray(menu?.children) && menu.children.length > 0;

  const selfAllowed = getAllowKeys(menu).some((k) => permissionIds.includes(k));

  if (!hasChildren) return selfAllowed;

  const anyChildAllowed = menu.children.some((c) =>
    isAllowed(permissionIds, c),
  );
  return selfAllowed || anyChildAllowed;
};

// ✅ group: active ถ้าลูก active หรือ path ตรงแบบ exact
// ✅ leaf: active แบบ prefix
const isActive = (pathname, menu) => {
  const hasChildren = Array.isArray(menu?.children) && menu.children.length > 0;

  if (hasChildren) {
    const childActive = menu.children.some((c) => isActive(pathname, c));
    return childActive || matchExact(pathname, menu.path);
  }

  return matchPrefix(pathname, menu.path);
};

function SideBar({ open }) {
  const { permissions } = useAuth();
  const location = useLocation();

  const [Permission, setPermission] = React.useState([]);
  const [ExpandedIds, setExpandedIds] = React.useState(new Set()); // ✅ ใช้ id เปิด/ปิด

  React.useEffect(() => {
    if (!isEmpty(permissions)) setPermission(permissions);
  }, [permissions]);

  const toggleById = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ✅ render แบบ recursive
  const renderMenus = (menus, level = 0) => {
    return menus.map((item) => {
      if (!item.authRequired) return null;
      if (!isAllowed(Permission, item)) return null;

      const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;
      const active = isActive(location.pathname, item);
      const opened = ExpandedIds.has(item.id);

      return (
        <div key={item.id}>
          <SidebarItem
            isChildren={hasChildren}
            onClick={hasChildren ? () => toggleById(item.id) : undefined}
            href={item.path || ""}
            debugKey={item.id}
            forceActive={active} // ✅ ให้กลุ่ม active เมื่อมีลูก active
            className={`py-2 cursor-pointer w-full ${
              level === 0 ? "px-4" : "px-2"
            }`}
          >
            {level === 0 && item.icon ? (
              <item.icon className="mr-2 text-[23px]" />
            ) : (
              <span className="mr-2">{level > 0 ? "•" : ""}</span>
            )}

            <span className="truncate">{item.label}</span>

            {hasChildren && (
              <MdKeyboardArrowRight
                className={`ml-auto transition-transform duration-200 ${
                  opened ? "transform rotate-90" : ""
                }`}
              />
            )}
          </SidebarItem>

          {hasChildren && (
            <div
              className={`pl-4 transition-all ${
                opened ? "h-auto" : "h-0"
              } overflow-hidden`}
            >
              {renderMenus(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className={`${
        open ? "w-64" : "w-0"
      } flex flex-col overflow-hidden transition-width duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-center h-16 bg-gray-600">
        <img
          src={Thunder_logo}
          alt={import.meta.env.VITE_APP_NAME}
          className="h-8 mr-2"
        />
        <span className="text-white">{import.meta.env.VITE_APP_NAME}</span>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-gray-300 shadow-md border border-r">
          {renderMenus(AllRouters, 0)}
        </nav>
      </div>
    </div>
  );
}

SideBar.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default SideBar;
