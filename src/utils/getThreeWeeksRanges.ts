export function getThreeWeeksRanges() {
  const now = new Date();

  const format = (date: Date) =>
    date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    });

  const currentWeekEnd = new Date(now);
  currentWeekEnd.setDate(now.getDate() + ((7 - now.getDay()) % 7));

  const currentRange = `${format(now)} - ${format(currentWeekEnd)}`;

  const nextWeekStart = new Date(currentWeekEnd);
  nextWeekStart.setDate(currentWeekEnd.getDate() + 1);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

  const nextRange = `${format(nextWeekStart)} - ${format(nextWeekEnd)}`;

  const afterNextWeekStart = new Date(nextWeekStart);
  afterNextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const afterNextWeekEnd = new Date(afterNextWeekStart);
  afterNextWeekEnd.setDate(afterNextWeekStart.getDate() + 6);

  const afterNextRange = `${format(afterNextWeekStart)} - ${format(
    afterNextWeekEnd
  )}`;

  return [currentRange, nextRange, afterNextRange];
}
