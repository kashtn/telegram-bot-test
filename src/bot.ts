import { Bot, Context, Keyboard, session, SessionFlavor } from "grammy";
import { getSheetData, insertClient } from "./googleSheets";
import dotenv from "dotenv";
import { EMenu } from "./menus/EMenu";
import mainMenu from "./menus/mainMenu";
import weekMenu from "./menus/weekMenu";
import dayMenu from "./menus/dayMenu";
import processMenu from "./menus/processMenu";
import timeOrMasterMenu from "./menus/timeOrMasterMenu";
import masterMenu from "./menus/masterMenu";
import timeMenu from "./menus/timeMenu";
import confirmMenu from "./menus/confirmMenu";
dotenv.config();

interface SessionData {
  currentDayTable: [][];

  chosenWeek?: string;
  chosenDay?: string;
  chosenTime?: string;
  chosenProcess?: string;
  chosenMaster?: string;

  phoneNumber?: string;
  userName?: string;
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
      chosenProcess: "",
      chosenMaster: "",
      chosenWeek: "",
    }),
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

processMenu.register(weekMenu);

mainMenu.register(processMenu);

bot.use(mainMenu);

//

bot.api.setMyCommands([
  { command: "menu", description: "Меню" },
  { command: "help", description: "Связаться с менеджером" },
  { command: "data", description: "Просмотреть таблицу" },
]);

bot.command("start", async (ctx) => {
  // Создание клавиатуры с кнопкой запроса контакта
  const keyboard = new Keyboard()
    .requestContact("Поделиться номером телефона")
    .build();

  await ctx.reply("Добро пожаловать в бот студии маникюра «Ноготочки»!");

  await ctx.reply(
    "Для работы с ботом, пожалуйста, авторизуйтесь через свой номер телефона:",
    {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
});

bot.command("menu", async (ctx) => {
  if (!ctx.session.phoneNumber) {
    const keyboard = new Keyboard()
      .requestContact("Поделиться номером телефона")
      .build();

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

// Обработка полученного контакта
bot.on("message:contact", async (ctx) => {
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number;
  const firstName = contact.first_name;

  ctx.session.phoneNumber = phoneNumber;
  ctx.session.userName = firstName;

  await ctx.reply(`Вы авторизовались! \nГлавное Меню:`, {
    reply_markup: mainMenu,
  });
});

bot.start();
