export function getCurrentDate() {
  const date = new Date();

  // Получаем день, добавляем ведущий ноль при необходимости
  const day = String(date.getDate()).padStart(2, "0");

  // Получаем месяц, добавляем ведущий ноль и увеличиваем на 1, так как месяцы в JavaScript считаются с 0
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Получаем последние две цифры года
  const year = String(date.getFullYear()).slice(2);

  const formattedDate = `${day}.${month}.${year}`;

  return formattedDate;
}
