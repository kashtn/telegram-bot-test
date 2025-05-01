export function convertToUnix(dateString: string) {
  const [day, month] = dateString.split(".").map(Number);

  // Получаем текущий год
  const currentYear = new Date().getFullYear();

  // Создаем объект Date
  const date = new Date(Date.UTC(currentYear, month - 1, day));

  // Получаем метку времени UNIX
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  return unixTimestamp;
}
