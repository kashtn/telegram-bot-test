import { Bot, Context, session, SessionFlavor } from "grammy";
import { Menu } from "@grammyjs/menu";
import { getSheetData, insertClient } from "./googleSheets";
// import { format } from "date-fns";
// import { ru } from "date-fns/locale";
import dotenv from "dotenv";
dotenv.config();

interface SessionData {
  step: "idle" | "awaiting_phone" | "awaiting_name" | "awaiting_date";
  bookingData: {
    phone?: string;
    name?: string;
    date?: string;
  };
}

type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>(process.env.BOT_ID as string);

// Middleware to handle sessions
bot.use(
  session({
    initial: (): SessionData => ({
      step: "idle",
      bookingData: {},
    }),
  })
);

// Main menu
const mainMenu = new Menu("main-menu")
  .submenu("📝 Записаться", "ops-menu")
  .row()
  .text("📅 Мои записи", async (ctx) => {
    return ctx.reply(`Ваши записи:`);
  })
  .row()
  .text("👩‍💼 Связаться с менеджером", (ctx) => {
    return ctx.reply(
      "Для связи с менеджером:\n☎️ +7 (XXX) XXX-XX-XX\n✉️ manager@nogotochki.ru"
    );
  })
  .row();

const opsMenu = new Menu("ops-menu").submenu("💅 Маникюр", "dates-menu");

const datesMenu = new Menu("dates-menu");

getThreeWeeksRanges().forEach((week) => {
  datesMenu.text(week, async (ctx) => {
    const times = ["10:00", "12:00", "14:00", "16:00", "18:00"];
    times.forEach((time) => {});
    const buttons = times.map((t) => [
      { text: t, callback_data: `time:${week}:${t}` },
    ]);
    buttons.push([{ text: "🔙 Назад", callback_data: `back:ops` }]);
    await ctx.editMessageText(`Вы выбрали ${week}. Выберите время:`, {
      reply_markup: { inline_keyboard: buttons },
    });
  });
  datesMenu.row();
});

bot.callbackQuery(/^time:/, async (ctx) => {
  const data = ctx.callbackQuery.data;
  const [, dateRange, hours, minutes] = data.split(":");
  await ctx.answerCallbackQuery();
  await ctx.deleteMessage();
  await ctx.reply(`✅Вы записаны на: ${dateRange} в ${hours}:${minutes}`);

  insertClient(dateRange, `${hours}:${minutes}`);
});

opsMenu.register(datesMenu);

mainMenu.register(opsMenu);

bot.use(mainMenu);

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Добро пожаловать в бот студии маникюра «Ноготочки»!\nВыберите действие:",
    { reply_markup: mainMenu }
  );
});

bot.command("menu", async (ctx) => {
  await ctx.reply("Меню:", { reply_markup: mainMenu });
});

bot.command("data", async (ctx) => {
  try {
    const rows = await getSheetData();

    if (rows.length === 0) {
      await ctx.reply("Нет данных в таблице.");
      return;
    }

    const message = rows.map((row) => row.join(" | ")).join("\n");
    await ctx.reply(`Данные из таблицы:\n\n${message}`);
  } catch (err) {
    console.error(err);
    await ctx.reply("Ошибка при получении данных из Google Sheets");
  }
});

bot.catch((err) => {
  console.error("Error in bot:", err);
});

bot.api.setMyCommands([
  { command: "menu", description: "Меню" },
  { command: "help", description: "Связаться с менеджером" },
  { command: "data", description: "Просмотреть таблицу" },
]);

bot.start();

function getThreeWeeksRanges() {
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
