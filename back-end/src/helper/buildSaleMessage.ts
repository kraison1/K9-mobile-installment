import { formatNumberDigit, formatNumberDigit2 } from './formatNumber';
import { formatDateNumberWithoutTime } from './formatDate';
import { isEmpty } from 'lodash';

interface notiProductSale {
  isCancel: '0' | '1';
  payType: '1' | '2' | '3';
  bankNo: string | null;
  bankOwner: string | null;
  bankName: string | null;
  sumCash: string;
  sumTransfer: string;
  count: string;
}

async function buildSaleMessage({
  branchName,
  date,
  typeLabel,
  productSales,
  totalCount,
  contractCount,
  contractTotalPaid,
}: {
  branchName: string;
  date: Date;
  typeLabel: string;
  productSales: notiProductSale[];
  totalCount: number;
  contractCount: number;
  contractTotalPaid: number;
}): Promise<string> {
  let message = ``;

  if (!isEmpty(branchName)) {
    `สรุปยอดขาย ${typeLabel} สาขา: ${branchName}\nวันที่: ${formatDateNumberWithoutTime(date)}\n------------------------------\n`;
  }

  // แยกข้อมูลตามสถานะยกเลิก/ไม่ยกเลิก
  const notCancelled = productSales.filter((p) => p.isCancel === '0');
  const cancelled = productSales.filter((p) => p.isCancel === '1');

  // สร้างข้อความสำหรับแต่ละกลุ่มบัญชี
  const buildBankMessage = (entries: notiProductSale[]): string => {
    if (!entries.length) return '(ไม่มีรายการ)\n';

    // จัดกลุ่มตามบัญชี
    const groupedByBank: Record<string, notiProductSale[]> = entries.reduce(
      (acc, entry) => {
        const key = `${entry.bankName || 'ไม่ระบุ'}-${entry.bankNo || ''}`;
        acc[key] = acc[key] || [];
        acc[key].push(entry);
        return acc;
      },
      {} as Record<string, notiProductSale[]>,
    );

    let detail = '';
    for (const [key, list] of Object.entries(groupedByBank)) {
      const { bankName, bankNo, bankOwner } = list[0];
      const bankLabel = bankName
        ? `${bankName} ${bankNo || ''} (${bankOwner || 'ไม่ระบุชื่อ'})`
        : '-';

      // คำนวณยอดรวมของบัญชีนี้
      const total = list.reduce(
        (sum, e) => sum + Number(e.sumCash || 0) + Number(e.sumTransfer || 0),
        0,
      );

      detail += `บัญชี: ${bankLabel}\n`;

      // รายละเอียดแต่ละประเภทการชำระเงิน
      for (const row of list) {
        const cash = Number(row.sumCash || 0);
        const transfer = Number(row.sumTransfer || 0);
        const count = Number(row.count);

        if (row.payType === '1') {
          detail += `- เงินสด: ${formatNumberDigit(cash)} บาท (${count} รายการ)\n`;
        } else if (row.payType === '2') {
          detail += `- โอน: ${formatNumberDigit(transfer)} บาท (${count} รายการ)\n`;
        } else if (row.payType === '3') {
          detail += `- เงินสด+โอน (${count} รายการ) :\n`;
          detail += `   • เงินสด: ${formatNumberDigit(cash)} บาท\n`;
          detail += `   • โอน: ${formatNumberDigit(transfer)} บาท\n`;
        }
      }

      detail += `รวม: ${formatNumberDigit(total)} บาท\n------------------------------\n`;
    }

    return detail;
  };

  // เพิ่มข้อมูลไม่ยกเลิกและยกเลิก
  message += `\nไม่ยกเลิก\n${buildBankMessage(notCancelled)}`;
  message += `------------------------------\n`;
  message += `\nยกเลิก\n${buildBankMessage(cancelled)}`;
  message += `------------------------------\n`;
  message += `มีในสัญญารวม: ${formatNumberDigit(contractCount)} รายการ\n`;
  message += `รวม: ${formatNumberDigit(contractTotalPaid)} บาท\n`;
  message += `------------------------------\n`;
  message += `รายการรวม: ${formatNumberDigit(totalCount)} รายการ`;

  return message;
}

export { buildSaleMessage };
