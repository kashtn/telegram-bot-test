import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";

const timeOrMasterMenu = new Menu(EMenu.timeOrMasterMenu)
  .submenu("🙍🏼‍♀️ Выбору мастера", EMenu.masterMenu, async (ctx) => {
    await ctx.editMessageText("Выберите мастера:");
  })
  .row()
  .submenu("🕘 Выбору времени", EMenu.timeMenu, async (ctx) => {
    await ctx.editMessageText("Выберите время:");
  })
  .row();

timeOrMasterMenu.back("⬅️ Назад");

export default timeOrMasterMenu;
