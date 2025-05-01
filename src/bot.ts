import {
  Bot,
  Context,
  Keyboard,
  session,
  SessionFlavor,
  MemorySessionStorage,
} from "grammy";
import { getSheetData, insertClient } from "./googleSheets";
import dotenv from "dotenv";
import { EMenu } from "./menus/EMenu";
import mainMenu from "./menus/mainMenu";
import weekMenu from "./menus/weekMenu";
import dayMenu from "./menus/dayMenu";
import procedureMenu from "./menus/procedureMenu";
import timeOrMasterMenu from "./menus/timeOrMasterMenu";
import masterMenu from "./menus/masterMenu";
import timeMenu from "./menus/timeMenu";
import confirmMenu from "./menus/confirmMenu";
import supabaseClient from "./supabase";
dotenv.config();

interface SessionData {
  currentDayTable: [][];

  chosenWeek?: string;
  chosenDay?: string;
  chosenTime?: string;
  chosenProcedure?: string;
  chosenMaster?: string;

  phoneNumber?: string;
  fullName?: string;
  login?: string;
  telegramId?: number;
  waitingForFullName?: boolean;
  waitingForContact?: boolean;
}

type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>(process.env.BOT_ID as string);

// Middleware to handle sessions
bot.use(
  session({
    initial: (): SessionData => ({
      currentDayTable: [],
      chosenDay: "",
      chosenTime: "",
      chosenProcedure: "",
      chosenMaster: "",
      chosenWeek: "",
    }),
    storage: new MemorySessionStorage(),
  })
);

bot.callbackQuery(/^time:/, async (ctx) => {
  const data = ctx.callbackQuery.data;

  const [, dateRange, hours, minutes] = data.split(":");

  await ctx.answerCallbackQuery();

  await ctx.deleteMessage();

  await ctx.reply(`✅Вы записаны на: ${dateRange} в ${hours}:${minutes}`);

  insertClient(dateRange, `${hours}:${minutes}`);
});

// menus register
timeMenu.register(confirmMenu);

masterMenu.register(confirmMenu);

timeOrMasterMenu.register([masterMenu, timeMenu]);

dayMenu.register(timeOrMasterMenu);

weekMenu.register(dayMenu);

procedureMenu.register(weekMenu);

mainMenu.register(procedureMenu);

bot.use(mainMenu);

//

bot.api.setMyCommands([
  { command: "menu", description: "Меню" },
  { command: "help", description: "Связаться с менеджером" },
  { command: "data", description: "Просмотреть таблицу" },
]);

// Команда /start
bot.command("start", async (ctx) => {
  // Создаем клавиатуру с кнопкой "Поделиться номером"
  const contactKeyboard = new Keyboard()
    .requestContact("📱 Поделиться номером")
    .resized() // Кнопка подстраивается под размер
    .oneTime(); // Скрывается после нажатия

  await ctx.reply("👋 Добро пожаловать в бот студии маникюра «Ноготочки»!");
  await ctx.reply("📞 Для входа поделитесь своим номером телефона:", {
    reply_markup: contactKeyboard,
  });

  // Устанавливаем флаг ожидания номера
  ctx.session.waitingForContact = true;
});

bot.command("menu", async (ctx) => {
  if (!ctx.session.phoneNumber) {
    const keyboard = new Keyboard()
      .requestContact("Поделиться номером телефона")
      .resized() // Автоматическое масштабирование
      .oneTime(); // Скрыть после нажатия

    await ctx.reply(
      "Для работы с ботом, пожалуйста, авторизуйтесь через свой номер телефона и укажите ФИО:",
      {
        reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  } else {
    await ctx.reply("Главное меню:", { reply_markup: mainMenu });
  }
});

bot.command("data", async (ctx) => {
  try {
    let { data: appointments, error } = await supabaseClient
      .from("appointments")
      .select("*")
      .eq("telegram_id", ctx.session.telegramId);

    // Filters

    // const rows = await getSheetData();

    // if (rows.length === 0) {
    //   await ctx.reply("Нет данных в таблице.");
    //   return;
    // }

    // const message = rows.map((row) => row.join(" | ")).join("\n");
    appointments?.forEach(async (appointment, index) => {
      await ctx.reply(
        `Запись ${index}: ${appointment.procedure}, ${appointment.date}, ${appointment.slot_time}`
      );
    });
  } catch (err) {
    console.error(err);
    await ctx.reply("Ошибка при получении данных из Google Sheets");
  }
});

bot.catch((err) => {
  console.error("Error in bot:", err);
});

// Обработка полученного контакта
// Обработка ТОЛЬКО контакта (игнорируем ручной ввод)
bot.on("message:contact", async (ctx) => {
  if (!ctx.session.waitingForContact) return;

  const contact = ctx.message.contact;

  // Проверяем, что контакт принадлежит отправителю
  if (contact.user_id !== ctx.from.id) {
    await ctx.reply("❌ Пожалуйста, поделитесь СВОИМ номером.");
    return;
  }
  console.log("contact", contact);

  const phoneNumber = contact.phone_number;

  const telegramId = contact.user_id;

  const login = ctx.from.username
    ? `@${ctx.from.username}`
    : contact.first_name || "Пользователь";

  // Сохраняем данные
  ctx.session.phoneNumber = phoneNumber;
  ctx.session.login = login;
  ctx.session.telegramId = telegramId;
  ctx.session.waitingForContact = false;

  // Убираем клавиатуру
  await ctx.reply("✅ Спасибо! Теперь введите ваше **ФИО**:", {
    parse_mode: "Markdown",
    reply_markup: { remove_keyboard: true },
  });

  // Ждем ФИО
  ctx.session.waitingForFullName = true;
});

// Обработка текстовых сообщений (только для ФИО)
bot.on("message:text", async (ctx) => {
  // Если пользователь пытается ввести номер вручную — игнорируем
  if (ctx.session.waitingForContact) {
    await ctx.reply("📛 Пожалуйста, нажмите кнопку **«Поделиться номером»**", {
      parse_mode: "Markdown",
    });
    return;
  }

  // Если ждем ФИО — обрабатываем
  if (ctx.session.waitingForFullName) {
    const fullName = ctx.message.text.trim();

    if (fullName.split(" ").length < 2) {
      await ctx.reply(
        "⚠️ Введите **полное ФИО** (например: Иванов Иван Иванович)",
        {
          parse_mode: "Markdown",
        }
      );
      return;
    }

    // Сохраняем ФИО
    ctx.session.fullName = fullName;
    ctx.session.waitingForFullName = false;

    await ctx.reply(`🎉 Отлично, ${fullName}! Вы авторизованы.`, {
      reply_markup: mainMenu, // Ваше главное меню
    });

    const { data, error } = await supabaseClient
      .from("clients")
      .insert([
        {
          telegram_id: ctx.session.telegramId,
          telegram_login: ctx.session.login,
          name: ctx.session.fullName,
          phone: ctx.session.phoneNumber,
        },
      ])
      .select();
    console.log("inserted data", data);
    console.log("error", error);

    console.log("Пользователь авторизован:", {
      phoneNumber: ctx.session.phoneNumber,
      fullName: ctx.session.fullName,
      login: ctx.session.login,
    });
  }
});

bot.start();
