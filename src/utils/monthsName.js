const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMonthWithYear = (date) => {
  if (!date) return "";

  return `${new Date(date).getMonth() + 1}, ${new Date(date).getFullYear()}`;
};

module.exports = {
  getMonthWithYear,
};
