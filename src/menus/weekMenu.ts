import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import { getThreeWeeksRanges } from "../utils/getThreeWeeksRanges";

const weekMenu = new Menu(EMenu.weekMenu);

getThreeWeeksRanges().forEach((week) => {
  weekMenu
    .submenu(week, EMenu.dayMenu, async (ctx) => {
      // Сохраняем выбранную неделю в сессии
      ctx.session.chosenWeek = week;

      // Переходим в подменю для выбора дней
    //   await ctx.menu.nav(EMenu.dayMenu);
    })
    .row();
});

weekMenu.back("⬅️ Назад");

export default weekMenu;
