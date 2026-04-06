/* eslint-disable no-case-declarations */
import { isEmpty } from "lodash";
const noopener_noreferrer = "noopener,noreferrer";
const buyMoreOne = "ยอดรวมต้องไม่เป็น 0 บาท";
const MESSAGE_SAVE_SUCCESS = "บันทึกสำเร็จ";
const MESSAGE_UPDATE_SUCCESS = "อัพเดตสำเร็จ";
import { LazyLoadImage } from "react-lazy-load-image-component";

const noImage = (fileImage, w, h) =>
  isEmpty(fileImage) == true ? (
    <p className="text-red-400">ไม่พบรูปภาพ</p>
  ) : (
    <LazyLoadImage
      src={`${import.meta.env.VITE_APP_API_URL}/${fileImage}`}
      className={`
        ${w ? `w-${w}` : "w-14"}
        ${h ? `h-${h}` : "h-14"}
        object-inherit cursor-pointer
      `}
      alt={import.meta.env.VITE_APP_NAME}
      onClick={() =>
        window.open(
          `${import.meta.env.VITE_APP_API_URL}/${fileImage}`,
          "_blank",
          noopener_noreferrer
        )
      }
    />
  );

const fontColor = (item) => {
  return `<span class="text-blue-500"> ${item || "-"}</span>`; // คืนค่า string HTML};
};

const handleCheckOpen = (type, value) => {
  if (!value) return; // ถ้าไม่มีค่า ไม่ต้องทำอะไร

  switch (type) {
    case "tel":
      window.location.href = `tel:${value}`;
      break;
    case "facebook":
      const fbUrl = value.startsWith("http")
        ? value
        : `https://facebook.com/${value}`;
      window.open(fbUrl, "_blank", noopener_noreferrer);
      break;
    default:
      break;
  }
};

const MIRROR_DELAY_MS = 2000;
const hasLetter = (s) => /[A-Za-z\u0E00-\u0E7F]/.test(s || "");
const onlyDigits = (s) => (s || "").replace(/[^\d]/g, "");

export {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_UPDATE_SUCCESS,
  noImage,
  buyMoreOne,
  fontColor,
  handleCheckOpen,
  noopener_noreferrer,
  MIRROR_DELAY_MS,
  hasLetter,
  onlyDigits,
};
