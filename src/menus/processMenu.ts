import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import weekMenu from "./weekMenu";

const processMenu = new Menu(EMenu.processMenu)
  .text("💅 Маникюр", async (ctx) => {
    await ctx.deleteMessage();
    await ctx.reply("Выберите дату:", { reply_markup: weekMenu });
    ctx.session.chosenProcess = "Маникюр";
  })
  .row()
  .text("🦶🏻 Педикюр", async (ctx) => {
    await ctx.deleteMessage();
    await ctx.reply("Выберите дату:", { reply_markup: weekMenu });
    ctx.session.chosenProcess = "Педикюр";
  })
  .row()
  .text("💆🏼‍♀️ Массаж", async (ctx) => {
    await ctx.deleteMessage();
    await ctx.reply("Выберите дату:", { reply_markup: weekMenu });
    ctx.session.chosenProcess = "Массаж";
  })
  .row()
  .back("⬅️ Назад");

export default processMenu;
