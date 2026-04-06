import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";
import { isEmpty } from "lodash";
import { formatDateNumberWithoutTime } from "src/helpers/formatDate";
import { error } from "src/components/alart";
import { formatNumberDigit } from "src/helpers/formatNumber";

// ฟังก์ชันสร้าง canvas สำหรับบาร์โค้ด 1 อัน
const generateCanvas = (item) => {
  return new Promise((resolve) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false }); // ปิด alpha เพื่อพื้นหลังขาวสนิท

    JsBarcode(svg, item?.catalog === "มือถือ" ? item.imei : item.code, {
      format: "CODE128",
      width: 3, // เพิ่มความหนาของเส้น (จาก 1 เป็น 3)
      height: 50, // เพิ่มความสูง (จาก 20 เป็น 50)
      displayValue: false,
      margin: 5, // เพิ่มระยะขอบเล็กน้อย
      background: "#ffffff",
      lineColor: "#000000",
    });

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // ปรับขนาด canvas เพื่อความคมชัดสูง
      canvas.width = 568; // 75mm ที่ ~300 DPI (75 * 7.559)
      canvas.height = 189; // 25mm ที่ ~300 DPI (25 * 7.559)

      // พื้นหลังสีขาว
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // เปิด anti-aliasing เพื่อขอบเรียบ
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // วาดบาร์โค้ด (ขยายขนาดและจัดตำแหน่ง)
      const barcodeWidth = 400; // ขยายบาร์โค้ด (จาก 150 เป็น 400)
      const barcodeHeight = 60; // ขยายความสูง (จาก 20 เป็น 60)

      const calXPosition = (canvas.width - barcodeWidth) / 2;

      const calYPosition =
        import.meta.env.VITE_SYSTEM_NAME == "THUNDER"
          ? canvas.height - 90
          : canvas.height - 70;

      const xPosition = calXPosition; // จัดกึ่งกลางแนวนอน
      const yPosition = calYPosition; // วางบาร์โค้ดให้สูงขึ้นเล็กน้อย

      ctx.drawImage(img, xPosition, yPosition, barcodeWidth, barcodeHeight);

      ctx.drawImage(img, xPosition, yPosition, barcodeWidth, barcodeHeight);

      // ตั้งค่าฟอนต์และสี
      ctx.font = "24px Arial"; // เพิ่มขนาดฟอนต์ (จาก 12px เป็น 18px)
      ctx.textAlign = "left";
      ctx.fillStyle = "black";

      if (
        item?.catalog === "มือถือ" &&
        import.meta.env.VITE_SYSTEM_NAME == "THUNDER"
      ) {
        // วาดเส้นคั่นแนวตั้ง
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";

        // ปรับตำแหน่งเส้นคั่นให้เหมาะสม
        ctx.moveTo(320, 10);
        ctx.lineTo(320, 40);
        ctx.moveTo(320, 40);
        ctx.lineTo(320, 70);
        ctx.moveTo(320, 70);
        ctx.lineTo(320, 100);
        ctx.stroke();

        // เติมข้อความ (ปรับตำแหน่งให้เหมาะสม)

        ctx.fillText(
          `${item?.productModel?.name || ""} ${
            item?.productStorage?.name || ""
          }`,
          20,
          30
        );
        ctx.fillText(
          `${item?.hand || ""} ${
            item?.shopCenterInsurance === "มี"
              ? item?.shopCenterInsuranceDate
                ? formatDateNumberWithoutTime(item?.shopCenterInsuranceDate)
                : "-"
              : ""
          }`,
          325,
          30
        );

        ctx.fillText(`${item?.productColor?.name || ""}` || "", 20, 60);

        ctx.fillText(item?.code || "", 325, 60);

        ctx.fillText(`Battery ${item?.batteryHealth || ""}%` || "", 20, 90);

        ctx.fillText(
          `ราคา ${formatNumberDigit(item?.priceSale) || 0} บ.`,
          325,
          90
        );

        ctx.fillText(item?.imei || "", 190, 180);
      } else if (
        item?.catalog === "มือถือ" &&
        import.meta.env.VITE_SYSTEM_NAME == "AAA"
      ) {
        // วาดเส้นคั่นแนวตั้ง
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";

        // ปรับตำแหน่งเส้นคั่นให้เหมาะสม
        ctx.moveTo(340, 10);
        ctx.lineTo(340, 40);
        ctx.moveTo(340, 40);
        ctx.lineTo(340, 70);
        ctx.moveTo(340, 70);
        ctx.lineTo(340, 100);
        ctx.stroke();

        // เติมข้อความ (ปรับตำแหน่งให้เหมาะสม)
        ctx.fillText(item?.code || "", 20, 30);
        ctx.fillText(item?.refOldStockNumber || "", 350, 30);

        ctx.fillText(item?.productModel?.name || "", 20, 60);
        ctx.fillText(
          `${item?.hand || ""} ${
            item?.shopCenterInsurance === "มี"
              ? item?.shopCenterInsuranceDate
                ? formatDateNumberWithoutTime(item?.shopCenterInsuranceDate)
                : "-"
              : ""
          }`,
          350,
          60
        );

        ctx.fillText(
          `${item?.productStorage?.name || ""} ${
            item?.batteryHealth || ""
          }% ${item?.productColor?.name || ""}` || "",
          20,
          90
        );
        ctx.fillText(item?.imei || "", 350, 90);
      } else if (item?.catalog === "ocr") {
        ctx.fillText(`ocrCode: ${item?.code || ""}`, 20, 30);
      } else {
        if (import.meta.env.VITE_SYSTEM_NAME == "AAA") {
          ctx.fillText(item?.productModel?.name || "", 20, 30);
          ctx.fillText(`สี: ${item?.productColor?.name || ""}`, 20, 60);
          ctx.fillText(
            `ราคาขายปลีก: ${formatNumberDigit(item?.priceSale) || 0} บ.`,
            20,
            90
          );
        } else {
          ctx.fillText(item?.productModel?.name || "", 20, 30);
          ctx.fillText(
            `ราคาขายปลีก: ${formatNumberDigit(item?.priceSale) || 0} บ.`,
            310,
            30
          );
          ctx.fillText(`สี: ${item?.productColor?.name || ""}`, 20, 60);
          ctx.fillText(item?.code || "", 150, 180);
        }
      }

      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.src = url;
  });
};

export const generateMultipleBarcodesPDF = async (selectedItems) => {
  if (isEmpty(selectedItems)) {
    error("กรุณาเลือกสินค้าอย่างน้อย 1 รายการ");
    return;
  }

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [75, 25], // 75mm x 25mm
  });

  for (let i = 0; i < selectedItems.length; i++) {
    if (i > 0) pdf.addPage(); // เพิ่มหน้าใหม่

    const canvas = await generateCanvas(selectedItems[i]);
    const imgData = canvas.toDataURL("image/png", 1.0); // คุณภาพสูงสุด

    // ปรับขนาดใน PDF
    const widthInMm = 72; // ขยายให้เต็มพื้นที่ (จาก 75 เป็น 72 เพื่อขอบ)
    const heightInMm = 24; // ขยายให้เต็ม (จาก 25 เป็น 24)
    const xOffset = 1.5; // ขอบซ้าย
    const yOffset = 0.5; // ขอบบน

    pdf.addImage(imgData, "PNG", xOffset, yOffset, widthInMm, heightInMm);
  }

  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
};
