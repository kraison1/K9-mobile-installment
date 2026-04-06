import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "src/hooks/authContext";
import { AllRouters } from "src/routers";
import ProtectedRoute from "src/routers/protectedRouter";
import NotFoundPage from "./pages/notfound";

// --- helper ---
const flattenRoutes = (nodes = []) => {
  const out = [];

  const walk = (node) => {
    if (!node) return;

    // ✅ เก็บเฉพาะที่เป็น "หน้า" จริง
    if (node.path && node.element) {
      out.push({
        id: node.id,
        legacyIds: node.legacyIds || [],
        path: node.path,
        element: node.element,
        authRequired: node.authRequired,
      });

      // (ถ้ามี legacyPaths ค่อยเปิดใช้)
      if (Array.isArray(node.legacyPaths)) {
        node.legacyPaths.forEach((p) => {
          out.push({
            id: node.id,
            legacyIds: node.legacyIds || [],
            path: p,
            element: node.element,
            authRequired: node.authRequired,
          });
        });
      }
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(walk);
    }
  };

  nodes.forEach(walk);
  return out;
};

const App = () => {
  const routes = React.useMemo(() => flattenRoutes(AllRouters), []);

  return (
    <Router basename="/">
      <AuthProvider>
        <Routes>
          {routes.map((r) => (
            <Route
              key={`${r.id}:${r.path}`}
              path={r.path}
              element={
                <ProtectedRoute
                  id={r.id}
                  legacyIds={r.legacyIds}
                  element={r.element}
                  auth={r.authRequired}
                />
              }
            />
          ))}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
