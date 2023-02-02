

function updateDate(date) {
    year = parseInt(date.split('-')[0]) + 1
    year = year.toString()
    const newDate = year + '-' + date.substring(5, 10)
    return newDate;
}

function updateSDate(date, months) {
    year = parseInt(date.split('-')[0])
    month = parseInt(date.split('-')[1]) + months
    if (month > 12) {
        month -= 12
        year += 1
    }
    if (month < 10) {
        month = '0' + month.toString();
    }
    const newDate = year + '-' + month + '-' + date.substring(8, 10)
    return newDate

}


module.exports = {updateDate, updateSDate}