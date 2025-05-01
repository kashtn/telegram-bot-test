import { Bot } from "grammy";
import { insertClient } from "../googleSheets";

export function subscribeCallbackQueries(botInstance: Bot) {
  botInstance.callbackQuery(/^time:/, async (ctx) => {
    const data = ctx.callbackQuery.data;

    const [, dateRange, hours, minutes] = data.split(":");

    await ctx.answerCallbackQuery();

    await ctx.deleteMessage();

    await ctx.reply(`✅Вы записаны на: ${dateRange} в ${hours}:${minutes}`);

    insertClient(dateRange, `${hours}:${minutes}`);
  });

  botInstance.callbackQuery("back")
}
