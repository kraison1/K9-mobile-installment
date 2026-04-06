import PropTypes from "prop-types";
import { NavLink, useLocation } from "react-router-dom";

const normalize = (href = "") => {
  const base = String(href).split("?")[0];
  return base.endsWith("/*") ? base.slice(0, -2) : base;
};

const matchPrefix = (pathname, href) => {
  if (!href) return false;
  const h = normalize(href).toLowerCase();
  const p = String(pathname).toLowerCase();
  if (h === "/") return p === "/";
  return p === h || p.startsWith(h + "/");
};

const SidebarItem = ({
  isChildren = false,
  onClick = undefined,
  href = "",
  children,
  className = "",
  debugKey = "",
  forceActive = false,
}) => {
  const location = useLocation();
  const active = forceActive || matchPrefix(location.pathname, href);

  const commonClass = `flex items-center p-1 my-1 hover:text-blue-500 hover:bg-blue-300 rounded-lg ${
    active ? "text-blue-500 bg-blue-200" : "text-gray-500"
  } ${className}`;

  if (isChildren) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={commonClass}
        data-menu-id={debugKey}
        data-href={href}
      >
        {children}
      </button>
    );
  }

  return (
    <NavLink
      to={href || "/"}
      className={commonClass}
      data-menu-id={debugKey}
      data-href={href}
    >
      {children}
    </NavLink>
  );
};

SidebarItem.propTypes = {
  isChildren: PropTypes.bool,
  onClick: PropTypes.func,
  href: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  debugKey: PropTypes.string,
  forceActive: PropTypes.bool,
};

export default SidebarItem;
