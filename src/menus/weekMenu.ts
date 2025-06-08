import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import { getThreeWeeksRanges } from "../utils/getThreeWeeksRanges";
import { TContext } from "../bot";

const weekMenu = new Menu<TContext>(EMenu.weekMenu);

getThreeWeeksRanges().forEach((week) => {
  weekMenu
    .submenu(week, EMenu.dayMenu, async (ctx) => {
      ctx.session.appointment.week = week;

      await ctx.editMessageText("Выберите день:");
    })
    .row();
});

weekMenu.back("⬅️ Назад");

export default weekMenu;
