import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

// Custom CSS for smaller, polished alerts
const style = document.createElement("style");
style.innerHTML = `
  .swal2-small {
    width: 300px !important;
    font-size: 14px !important;
    padding: 10px !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }
  .swal2-small .swal2-title {
    font-size: 16px !important;
    margin: 10px 0 !important;
    color: #333 !important;
    font-weight: 500 !important;
  }
  .swal2-small .swal2-icon {
    width: 40px !important;
    height: 40px !important;
    margin: 10px auto !important;
  }
  .swal2-small .swal2-confirm, .swal2-small .swal2-deny {
    padding: 6px 12px !important;
    font-size: 13px !important;
    border-radius: 4px !important;
    transition: background-color 0.2s !important;
  }
  .swal2-small .swal2-confirm:hover, .swal2-small .swal2-deny:hover {
    opacity: 0.9 !important;
  }
`;
document.head.appendChild(style);

// Common configuration for all alerts
const baseConfig = {
  position: "top-end",
  customClass: {
    // popup: "swal2-small",
  },
};

// Success alert
const success = (text) => {
  Swal.fire({
    ...baseConfig,
    icon: "success",
    title: text,
    showConfirmButton: false,
    timer: 1500,
  });
};

// Error alert
const error = (text) => {
  Swal.fire({
    ...baseConfig,
    position: "center",
    icon: "error",
    title: text,
    showConfirmButton: false,
    timer: 5000,
  });
};

// Warning alert
const warning = (text) => {
  Swal.fire({
    ...baseConfig,
    position: "center",
    icon: "warning",
    title: text,
    showConfirmButton: false,
    timer: 5000,
  });
};

// Confirmation alert
const conFirm = async (
  text,
  confirmText = "Confirm",
  denyText = "Cancel",
  showDeny = false
) => {
  return Swal.fire({
    ...baseConfig,
    position: "center",
    icon: "warning",
    title: text,
    confirmButtonColor: "#667EEA",
    showDenyButton: showDeny,
    confirmButtonText: confirmText,
    denyButtonText: denyText,
  });
};

export { success, error, warning, conFirm };
