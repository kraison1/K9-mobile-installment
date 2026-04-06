import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import PropTypes from "prop-types";
import { formatDateNumberWithoutTime } from "src/helpers/formatDate";
import { jsPDF } from "jspdf";
import { formatNumberDigit } from "src/helpers/formatNumber";

const BarcodeGenerator = ({ value }) => {
  const barcodeRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      // สร้างบาร์โค้ดด้วย JsBarcode
      JsBarcode(
        barcodeRef.current,
        value?.catalog === "มือถือ" ? value.imei : value.code,
        {
          format: "CODE128",
          width: 1, // เพิ่มความหนาของเส้น (จาก 2 เป็น 3)
          height: 50, // เพิ่มความสูงของบาร์โค้ด (จาก 30 เป็น 50)
          displayValue: false,
          margin: 5,
          background: "#ffffff",
          lineColor: "#000000",
        }
      );

      const svg = barcodeRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: false });

      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = function () {
        // ตั้งขนาด canvas ให้ใหญ่ขึ้นเพื่อความชัดเจน
        canvas.width = 568; // 75mm ที่ ~300 DPI
        canvas.height = 189; // 25mm ที่ ~300 DPI

        // พื้นหลังสีขาว
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // เปิด anti-aliasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // วาดบาร์โค้ด (ขยายขนาดและจัดตำแหน่ง)
        const barcodeWidth = 400; // ขยายบาร์โค้ดให้ใหญ่ขึ้น (จาก 300 เป็น 400)
        const barcodeHeight = 60; // ขยายความสูง (จาก 40 เป็น 60)

        const calXPosition = (canvas.width - barcodeWidth) / 2;

        const calYPosition =
          import.meta.env.VITE_SYSTEM_NAME == "THUNDER"
            ? canvas.height - 90
            : canvas.height - 70;

        const xPosition = calXPosition; // จัดกึ่งกลางแนวนอน
        const yPosition = calYPosition; // วางบาร์โค้ดให้สูงขึ้นเล็กน้อย

        ctx.drawImage(img, xPosition, yPosition, barcodeWidth, barcodeHeight);

        // ตั้งค่าฟอนต์และสีสำหรับข้อความ
        ctx.font = "24px Arial"; // เพิ่มขนาดฟอนต์เล็กน้อยเพื่อสมดุล
        ctx.textAlign = "left";
        ctx.fillStyle = "black";

        if (
          value?.catalog === "มือถือ" &&
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
            `${value?.productModel?.name || ""} ${
              value?.productStorage?.name || ""
            }`,
            20,
            30
          );
          ctx.fillText(
            `${value?.hand || ""} ${
              value?.shopCenterInsurance === "มี"
                ? value?.shopCenterInsuranceDate
                  ? formatDateNumberWithoutTime(value?.shopCenterInsuranceDate)
                  : "-"
                : ""
            }`,
            325,
            30
          );

          ctx.fillText(`${value?.productColor?.name || ""}` || "", 20, 60);

          ctx.fillText(value?.code || "", 325, 60);

          ctx.fillText(`Battery ${value?.batteryHealth || ""}%` || "", 20, 90);

          ctx.fillText(
            `ราคา ${formatNumberDigit(value?.priceSale) || 0} บ.`,
            325,
            90
          );

          ctx.fillText(value?.imei || "", 190, 180);
        } else if (
          value?.catalog === "มือถือ" &&
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
          ctx.fillText(value?.code || "", 20, 30);
          ctx.fillText(value?.refOldStockNumber || "", 350, 30);

          ctx.fillText(value?.productModel?.name || "", 20, 60);
          ctx.fillText(
            `${value?.hand || ""} ${
              value?.shopCenterInsurance === "มี"
                ? value?.shopCenterInsuranceDate
                  ? formatDateNumberWithoutTime(value?.shopCenterInsuranceDate)
                  : "-"
                : ""
            }`,
            350,
            60
          );

          ctx.fillText(
            `${value?.productStorage?.name || ""} ${
              value?.batteryHealth || ""
            }% ${value?.productColor?.name || ""}` || "",
            20,
            90
          );
          ctx.fillText(value?.imei || "", 350, 90);
        } else if (value?.catalog === "ocr") {
          ctx.fillText(`ocrCode: ${value?.code || ""}`, 20, 30);
        } else {
          if (import.meta.env.VITE_SYSTEM_NAME == "AAA") {
            ctx.fillText(value?.productModel?.name || "", 20, 30);
            ctx.fillText(`สี: ${value?.productColor?.name || ""}`, 20, 60);
            ctx.fillText(
              `ราคาขายปลีก: ${formatNumberDigit(value?.priceSale) || 0} บ.`,
              20,
              90
            );
          } else {
            ctx.fillText(value?.productModel?.name || "", 20, 30);
            ctx.fillText(
              `ราคาขายปลีก: ${formatNumberDigit(value?.priceSale) || 0} บ.`,
              310,
              30
            );
            ctx.fillText(`สี: ${value?.productColor?.name || ""}`, 20, 60);
            ctx.fillText(value?.code || "", 150, 180);
          }
        }

        URL.revokeObjectURL(url);
      };

      img.src = url;
    }
  }, [value]);

  const downloadBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not ready");
      return;
    }

    // แปลง canvas เป็นภาพ PNG คุณภาพสูง
    const imgData = canvas.toDataURL("image/png", 1.0);

    // สร้าง PDF
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [75, 25], // 75mm x 25mm
    });

    // ปรับขนาดภาพใน PDF ให้ใหญ่ขึ้น
    const widthInMm = 72; // ใช้พื้นที่เกือบเต็มหน้า (จาก 70 เป็น 72)
    const heightInMm = 24; // ใช้พื้นที่เกือบเต็ม (จาก 23 เป็น 24)
    const xOffset = 1.5; // ขอบซ้าย
    const yOffset = 0.5; // ขอบบน

    pdf.addImage(imgData, "PNG", xOffset, yOffset, widthInMm, heightInMm);

    // สร้าง Blob และเปิด PDF
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <svg
        ref={barcodeRef}
        onClick={downloadBarcode}
        className="cursor-pointer"
        style={{ width: "96px", height: "288px" }}
      ></svg>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
};

BarcodeGenerator.propTypes = {
  value: PropTypes.object,
};

export default BarcodeGenerator;
