import * as fs from 'fs-extra';
import * as path from 'path';
import { generateRandomString } from './generateRandomString';

async function renameFile(
  entity: any,
  field: string,
  indexOrSeq: number,
  useSeq: boolean,
  errors: string[],
): Promise<{ renamed: boolean }> {
  const oldPath = entity[field];
  const filename = path.basename(oldPath);

  // ตรวจสอบว่ารูปแบบชื่อไฟล์ไม่ใช่รูปแบบใหม่
  if (!filename.match(/^[a-f0-9]{6}-\d+\.png$/)) {
    try {
      // กำหนดลำดับสำหรับชื่อไฟล์
      let fileIndex: number;
      if (useSeq) {
        if ('seq' in entity && entity.seq != null) {
          // สำหรับ ProcessBookImage, ProcessCaseImage, ProcessSavingImage
          fileIndex = entity.seq;
        } else {
          errors.push(`No seq or payNo found in entity for ${oldPath}`);
          return { renamed: false };
        }
      } else {
        // ใช้ indexOrSeq ที่ส่งมา (สำหรับ ProductSaleImage, ProductBookImage, ProductSavingImage, ProductBuy)
        fileIndex = indexOrSeq;
      }

      // สร้างชื่อไฟล์ใหม่
      let randomName;
      let newFilename;
      let newPath;
      let attempts = 0;
      const maxAttempts = 5;

      do {
        randomName = generateRandomString(6);
        newFilename = `${randomName}-${fileIndex}.png`; // ใช้ fileIndex (seq หรือ index)
        newPath = path.join(path.dirname(oldPath), newFilename);
        attempts++;
      } while (fs.existsSync(newPath) && attempts < maxAttempts);

      if (fs.existsSync(newPath)) {
        errors.push(
          `New filename ${newFilename} already exists for ${oldPath}`,
        );
        return { renamed: false };
      }

      // ตรวจสอบว่าไฟล์เก่ามีอยู่จริง
      if (!fs.existsSync(oldPath)) {
        errors.push(`File not found: ${oldPath}`);
        return { renamed: false };
      }

      // ย้าย (rename) ไฟล์ในระบบไฟล์
      await fs.move(oldPath, newPath, { overwrite: true });

      // อัปเดตฟิลด์ในฐานข้อมูล
      entity[field] = newPath;
      await entity.constructor.getRepository().save(entity);

      return { renamed: true };
    } catch (error) {
      errors.push(`Failed to rename ${oldPath}: ${error.message}`);
      return { renamed: false };
    }
  } else {
    errors.push(`File ${oldPath} already in new format, skipped`);
    return { renamed: false };
  }
}

export { renameFile };
