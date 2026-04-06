import dayjs from "src/helpers/dayjsConfig";
// Function to format date in Thai including time
const formatDateTH = (item) => {
  return dayjs(item).format("DD/MM/BBBB HH:mm:ss น.");
};

// Function to format current date and time in Thai
const formatDateTimeZoneTH = (item) => {
  return dayjs(item).format("DD/MM/BBBB HH:mm น.");
};

// Function to format date in Thai without time, showing the full month name and Buddhist year
const formatDateTHWithOutTime = (item) => {
  return dayjs(item).format("DD MMM BBBB");
};

// Function to format date in Thai without time, using numeric month
const formatDateNumberWithoutTime = (item) => {
  return dayjs(item).format("DD/MM/BBBB");
};

// Function to format current date and time in Thai
const formatDateTimeOnlyZoneTH = (item) => {
  return dayjs(item).format("HH:mm:ss น.");
};

export {
  formatDateTH,
  formatDateTHWithOutTime,
  formatDateNumberWithoutTime,
  formatDateTimeZoneTH,
  formatDateTimeOnlyZoneTH,
};
