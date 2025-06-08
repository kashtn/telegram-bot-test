import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import { getDatesBetween } from "../utils/getDaysByRange";
import { TContext } from "../bot";

const dayMenu = new Menu<TContext>(EMenu.dayMenu).dynamic(async (ctx, range) => {
  getDatesBetween(ctx.session.appointment.week).forEach((day) => {
    range
      .submenu(day, EMenu.timeOrMasterMenu, async (ctx) => {
        ctx.session.appointment.day = day;

        await ctx.editMessageText("Перейти к:");
      })
      .row();
  });
  range.back("⬅️ Назад");
});

export default dayMenu;
