export function getDatesBetween(rangeStr: string) {
  // Разделяем строку на даты начала и конца
  const [startStr, endStr] = rangeStr.split(" - ").map((s) => s.trim());

  // Функция для разбора даты из строки 'dd.mm'
  function parseDate(dateStr: string, year: number) {
    const [day, month] = dateStr.split(".").map(Number);
    return new Date(year, month - 1, day); // month is zero-indexed
  }

  const currentYear = new Date().getFullYear();
  const startDate = parseDate(startStr, currentYear);
  const endDate = parseDate(endStr, currentYear);

  // Массив для хранения всех дат
  const dates = [];

  // Проходим по всем дням от startDate до endDate
  for (
    let date = startDate;
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    dates.push(`${day}.${month}`);
  }

  return dates;
}
