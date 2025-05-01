import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import { getDatesBetween } from "../utils/getDaysByRange";

const dayMenu = new Menu(EMenu.dayMenu).dynamic(async (ctx, range) => {
  console.log(ctx.session.chosenWeek);

  getDatesBetween(ctx.session.chosenWeek).forEach((day) => {
    range
      .submenu(day, EMenu.timeOrMasterMenu, (ctx) => {
        ctx.session.chosenDay = day;
      })
      .row();
  });
  range.back("⬅️ Назад");
});

export default dayMenu;
