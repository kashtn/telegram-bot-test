import {
  Bot,
  Context,
  Keyboard,
  session,
  SessionFlavor,
  MemorySessionStorage,
  InlineKeyboard,
} from "grammy";
import { MenuFlavor } from "@grammyjs/menu";
import { HydrateFlavor, hydrate } from "@grammyjs/hydrate";

import dotenv from "dotenv";
import mainMenu from "./menus/mainMenu";
import weekMenu from "./menus/weekMenu";
import dayMenu from "./menus/dayMenu";
import timeOrMasterMenu from "./menus/timeOrMasterMenu";
import masterMenu from "./menus/masterMenu";
import timeMenu from "./menus/timeMenu";
import confirmMenu from "./menus/confirmMenu";
import procedureMenu from "./menus/procedureMenu";

import { addNewClient, getUserByTelegramId } from "./api";
dotenv.config();

interface SessionData {
  currentDayTable: [][];

  allProcedures?: {};

  appointment: {
    week?: string;
    day?: string;
    time?: string;
    procedureId?: string;
    master: { name?: string; id?: number };
  };

  user: {
    phoneNumber?: string;
    fullName?: string;
    login?: string;
    telegramId?: number;
  };

  waitingForFullName?: boolean;
  waitingForContact?: boolean;
}

export type TContext = HydrateFlavor<
  Context & SessionFlavor<SessionData> & MenuFlavor
>;

const bot = new Bot<TContext>(process.env.BOT_ID as string);

bot.use(hydrate());
bot.use(
  session({
    initial: (): SessionData => ({
      currentDayTable: [],
      user: {},
      appointment: { master: {} },
    }),
    storage: new MemorySessionStorage(),
  })
);

// menus register
timeMenu.register(confirmMenu);

masterMenu.register(confirmMenu);

// timeOrMasterMenu.register([masterMenu, timeMenu]);

// dayMenu.register(timeOrMasterMenu);

weekMenu.register(dayMenu);

procedureMenu.register(weekMenu);

mainMenu.register(procedureMenu);

bot.use(mainMenu);

//

bot.api.setMyCommands([
  // { command: "menu", description: "Меню" },
  // { command: "help", description: "Связаться с менеджером" },
  { command: "webapp", description: "Приложение" },
]);

// Команда /start
bot.command("start", async (ctx) => {
  console.log(ctx.from);

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

bot.command("webapp", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .webApp("Открыть приложение", "https://nail-studio-webapp.netlify.app/");

  await ctx.reply("Нажмите кнопку для открытия веб-приложения:", {
    reply_markup: keyboard,
  });
});

// bot.on("web_app_data", async (ctx) => {
//   const dataFromWebApp = ctx.webAppData?.data; // Данные в формате строки
//   await ctx.reply(`Получено: ${dataFromWebApp}`);
// });

bot.command("menu", async (ctx) => {
  ctx.session = {
    currentDayTable: [],
    user: {},
    appointment: { master: {} },
  };

  const { user, error } = await getUserByTelegramId(String(ctx.from?.id));
  console.log("user", user);
  console.log("error", error);

  ctx.session.user = {
    phoneNumber: user?.phone,
    fullName: user?.name,
    login: user?.telegram_login,
    telegramId: user?.telegram_id,
  };

  if (!user && !ctx.session.user.phoneNumber) {
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
  } else {
    await ctx.reply("Главное меню:", { reply_markup: mainMenu });
  }
});

bot.catch((err) => {
  console.error("Error in bot:", err);
});

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
  ctx.session.user.phoneNumber = phoneNumber;
  ctx.session.user.login = login;
  ctx.session.user.telegramId = telegramId;
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
    ctx.session.user.fullName = fullName;
    ctx.session.waitingForFullName = false;

    await ctx.reply(`🎉 Отлично, ${fullName}! Вы авторизованы.`, {
      reply_markup: mainMenu, // Ваше главное меню
    });

    const error = await addNewClient({
      telegramId: ctx.session.user.telegramId || 0,
      phoneNumber: ctx.session.user.phoneNumber || "",
      telegramLogin: ctx.session.user.login || "",
      userName: ctx.session.user.fullName,
    });

    console.log("Пользователь авторизован:", {
      phoneNumber: ctx.session.user.phoneNumber,
      fullName: ctx.session.user.fullName,
      login: ctx.session.user.login,
    });
  }
});

bot.start();
