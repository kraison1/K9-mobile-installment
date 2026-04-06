import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

// Extend dayjs with the buddhistEra plugin to handle Buddhist calendar
dayjs.extend(buddhistEra);

// Function to format date in Thai including time
const formatDateTH = (item: any) => {
  dayjs.locale('th');
  // Formats the date and time in the Thai Buddhist calendar
  return dayjs(item).format('DD/MM/BBBB HH:mm:ss น.');
};

// Function to format date in Thai without time, showing the full month name and Buddhist year
const formatDateTHWithOutTime = (item: any) => {
  dayjs.locale('th');
  // Formats the date in the Thai Buddhist calendar with full month name and year
  return dayjs(item).format('DD MMMM พ.ศ. BBBB');
};

// Function to format date in Thai with Buddhist year (DD/MM/BBBB)
const formatDateNumberWithoutTime = (item: any) => {
  dayjs.locale('th');

  return dayjs(item).format('DD/MM/BBBB');
};

export { formatDateTH, formatDateTHWithOutTime, formatDateNumberWithoutTime };
