import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import { getSheetData } from "../googleSheets";
import { getCurrentDate } from "../utils/getCurrentDate";

const masterMenu = new Menu(EMenu.masterMenu).dynamic(async (ctx, range) => {
  let mastersArray;
  try {
    mastersArray = await getSheetData(`${ctx.session.chosenDay}.25!A1:ZZZ100`);
    console.log("mastersArray", mastersArray);

    ctx.session.currentDayTable = mastersArray;
  } catch (error) {
    if (error.message.includes("Unable to parse range")) {
      await ctx.reply("К сожалению, на этот день записи нет.");
      return ctx.menu.nav(EMenu.weekMenu, { immediate: true });
    }
  }
  const masters = mastersArray[0];

  if (ctx.session.chosenTime) {
    const currentRow = mastersArray.find(
      (row) => row[0] === ctx.session.chosenTime
    );

    const availableMasters = masters.filter(
      (master, index) => !currentRow![index]
    );

    availableMasters.forEach((master) => {
      range
        .submenu(master, EMenu.confirmMenu, (ctx) => {
          ctx.session.chosenMaster = master;
        })
        .row();
    });

    range.back("⬅️ Назад");
  }
});

export default masterMenu;
