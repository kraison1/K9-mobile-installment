/* eslint-disable react-refresh/only-export-components */
import { isEmpty } from "lodash";
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authLogout } from "src/store/user";

const AuthContext = React.createContext(null);

// Utility function to safely parse localStorage data
const safeParse = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Invalid ${key} data in localStorage:`, e);
    localStorage.removeItem(key);
    return defaultValue;
  }
};

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(() => safeParse("user", null));
  const [permissions, setPermissions] = React.useState(() =>
    safeParse("permissions", []),
  );
  const [isLoadingOpen, setIsLoadingOpen] = React.useState(false);

  const store = useSelector(
    (state) => state.user,
    (prev, next) =>
      prev.auth === next.auth && prev.permissions === next.permissions,
  );
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!isEmpty(store.auth) && store.auth !== user) {
      setUser(store.auth);
      localStorage.setItem("user", JSON.stringify(store.auth));
    }
  }, [store.auth, user]);

  React.useEffect(() => {
    if (!isEmpty(store.permissions) && store.permissions !== permissions) {
      setPermissions(store.permissions);
      localStorage.setItem("permissions", JSON.stringify(store.permissions));
    }
  }, [store.permissions, permissions]);

  // เพิ่ม effect เพื่อซิงโครไนซ์ localStorage กับ state เมื่อหน้า refresh
  React.useEffect(() => {
    const storedUser = safeParse("user", null);
    const storedPermissions = safeParse("permissions", []);
    if (storedUser && storedUser !== user) {
      setUser(storedUser);
      dispatch({ type: "user/setAuth", payload: storedUser });
    }
    if (storedPermissions && storedPermissions !== permissions) {
      setPermissions(storedPermissions);
      dispatch({ type: "user/setPermissions", payload: storedPermissions });
    }
  }, [dispatch]);

  const login = useCallback(
    (userData, permissionsData) => {
      setUser(userData);
      setPermissions(permissionsData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("permissions", JSON.stringify(permissionsData));
      dispatch({ type: "user/setAuth", payload: userData });
      dispatch({ type: "user/setPermissions", payload: permissionsData });
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    setIsLoadingOpen(true);
    try {
      await dispatch(authLogout()).unwrap();
      setUser(null);
      setPermissions([]);
      localStorage.clear();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoadingOpen(false);
    }
  }, [dispatch]);

  const contextValue = useMemo(
    () => ({
      user,
      permissions,
      login,
      logout,
      isLoadingOpen,
      setIsLoadingOpen,
    }),
    [user, permissions, login, logout, isLoadingOpen],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
