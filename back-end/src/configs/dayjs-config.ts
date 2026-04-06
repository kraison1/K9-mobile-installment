// dayjs-config.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// ขยาย dayjs ด้วยปลั๊กอินที่จำเป็น
dayjs.extend(utc);
dayjs.extend(timezone);

// กำหนดค่าให้ dayjs ใช้ timezone เป็น Asia/Bangkok
dayjs.tz.setDefault('Asia/Bangkok');

export default dayjs;
