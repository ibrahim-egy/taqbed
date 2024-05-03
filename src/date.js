function getLastPaymentDate() {
  // Explicitly set the timezone to Africa/Cairo
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" })
  );

  // Get the formatted date part (dd/mm/yyyy) using toLocaleString
  const formattedDate = now.toLocaleDateString("en-GB", {
    // en-GB for dd/mm/yyyy format
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Get formatted time part (hh:mm:ss AM/PM)
  const hours = now.getHours() % 12 || 12; // Convert to 12h format (12 for midnight/noon)
  const amPm = now.getHours() >= 12 ? "PM" : "AM";
  const formattedTime = `${hours.toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")} ${amPm}`;

  // Combine the formatted date and time
  const dateTime = `${formattedDate} | ${formattedTime}`;

  return dateTime;
}

function updateDate(date) {
  let year = parseInt(date.split("-")[0]) + 1;
  year = year.toString();
  const newDate = year + "-" + date.substring(5, 10);
  return newDate;
}

function updateSDate(date, months) {
  let year = parseInt(date.split("-")[0]);
  let month = parseInt(date.split("-")[1]) + months;
  if (month > 12) {
    month -= 12;
    year += 1;
  }
  if (month < 10) {
    month = "0" + month.toString();
  }
  const newDate = year + "-" + month + "-" + date.substring(8, 10);
  return newDate;
}

function isInteger(value) {
  return /^\d+$/.test(value);
}

module.exports = { updateDate, updateSDate, getLastPaymentDate, isInteger };
