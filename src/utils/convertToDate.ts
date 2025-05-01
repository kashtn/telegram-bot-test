export function convertToDate(dateString: string) {
  const [day, month] = dateString.split(".").map(Number);

  // Получаем текущий год
  const currentYear = new Date().getFullYear();

  // Форматируем дату в строку 'YYYY-MM-DD'
  const formattedDate = `${currentYear}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;

  return formattedDate;
}
