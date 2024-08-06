const moment = require("moment-timezone");

function getLastPaymentDate() {
  const now = moment.tz("Africa/Cairo");
  const formattedDateTime = now.format("DD/MM/YYYY | hh:mm:ss A");
  return formattedDateTime;
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
  while (month > 12) {
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
