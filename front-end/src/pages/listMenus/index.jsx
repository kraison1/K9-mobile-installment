import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "src/hooks/authContext";
import { AllRouters } from "src/routers";

const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

const getAllowKeys = (node) => uniq([node?.id, ...(node?.legacyIds || [])]);

const hasAccess = (permissions, node) => {
  const keys = getAllowKeys(node);
  return keys.some((k) => permissions.includes(k));
};

// แสดงหมวดได้ ถ้า:
// - ตัวเองมีสิทธิ์ หรือ
// - มีลูกหลานที่มีสิทธิ์
const canShowNode = (permissions, node) => {
  const kids = Array.isArray(node?.children) ? node.children : [];
  if (hasAccess(permissions, node)) return true;
  return kids.some((c) => canShowNode(permissions, c));
};

// node ที่เป็น “หน้าจริง” ต้องมี path + element
const isPageNode = (node) => Boolean(node?.path && node?.element);

const collectAccessiblePages = (permissions, node) => {
  const out = [];
  const kids = Array.isArray(node?.children) ? node.children : [];

  if (isPageNode(node) && canShowNode(permissions, node)) {
    out.push(node);
  }

  for (const c of kids) {
    out.push(...collectAccessiblePages(permissions, c));
  }

  return out;
};

// render เมนูย่อยแบบ recursive (หลายชั้น)
const renderTreeLinks = (permissions, nodes, level = 0) => {
  return nodes
    .filter((n) => canShowNode(permissions, n))
    .map((n) => {
      const kids = Array.isArray(n?.children) ? n.children : [];
      const hasKids = kids.length > 0;

      return (
        <li key={n.id} className={level > 0 ? "ml-4" : ""}>
          {isPageNode(n) ? (
            <Link
              to={n.path}
              className="flex items-center text-gray-600 hover:text-blue-600 p-1 rounded-md transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
              <span>{n.label}</span>
            </Link>
          ) : (
            <div className="flex items-center text-gray-700 p-1">
              <span className="mr-2 text-blue-400">•</span>
              <span className="font-medium">{n.label}</span>
            </div>
          )}

          {hasKids && (
            <ul className="space-y-1">
              {renderTreeLinks(permissions, kids, level + 1)}
            </ul>
          )}
        </li>
      );
    });
};

const ListMenusPage = () => {
  const { permissions } = useAuth();

  const allowedRouters = React.useMemo(() => {
    if (!permissions || permissions.length === 0) return [];
    return AllRouters.filter(
      (r) => r.authRequired && canShowNode(permissions, r),
    );
  }, [permissions]);

  // ✅ หมวดไม่มีเมนูย่อย = “root ที่เป็นหน้า” และไม่มี children
  const mainLinks = React.useMemo(() => {
    return allowedRouters.filter(
      (item) =>
        isPageNode(item) &&
        (!item.children || item.children.length === 0) &&
        canShowNode(permissions, item),
    );
  }, [allowedRouters, permissions]);

  // ✅ หมวดมีเมนูย่อย = root ที่มี children และมีอย่างน้อย 1 page ที่เข้าได้
  const groupedLinks = React.useMemo(() => {
    return allowedRouters
      .filter((item) => item.children && item.children.length > 0)
      .map((item) => {
        const pages = collectAccessiblePages(permissions, item);
        return { ...item, _pages: pages };
      })
      .filter((item) => item._pages.length > 0); // ต้องมีหน้าที่เข้าได้จริงอย่างน้อย 1
  }, [allowedRouters, permissions]);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid grid-cols-1 gap-8">
        {/* Header Section */}
        <header className="bg-white p-6 rounded-xl shadow-md text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            แผนผังเว็บไซต์
          </h1>
          <p className="text-gray-600 mt-2">
            ภาพรวมทั้งหมดของหน้าและฟีเจอร์ที่สามารถเข้าถึงได้
          </p>
        </header>

        {/* Main Links Section (หมวดไม่มีเมนูย่อย) */}
        <main className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">
            หมวดไม่มีเมนูย่อย
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mainLinks.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="bg-gray-50 hover:bg-blue-500 text-blue-600 hover:text-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center text-center font-semibold transform hover:-translate-y-1"
              >
                {item.icon && <item.icon className="mr-2 text-lg" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </main>

        {/* Grouped Links Section (หมวดมีเมนูย่อย) */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">
            หมวดมีเมนูย่อย
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedLinks.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg shadow-sm flex flex-col h-full p-5 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  {item.icon && (
                    <item.icon className="mr-3 text-2xl text-blue-500" />
                  )}
                  <span className="text-lg font-bold text-gray-900">
                    {item.label}
                  </span>
                </div>

                {/* ✅ แสดง tree จริง (รองรับ nested) */}
                <ul className="space-y-2 pt-4 border-t">
                  {renderTreeLinks(permissions, item.children, 0)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ListMenusPage;
