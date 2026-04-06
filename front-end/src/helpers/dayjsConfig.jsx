import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(buddhistEra);

// Set default timezone to Asia/Bangkok
dayjs.tz.setDefault("Asia/Bangkok");

// Set default locale to Thai
dayjs.locale("th");

export default dayjs;
