import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import { getSheetData } from "../googleSheets";
import { getCurrentDate } from "../utils/getCurrentDate";

const timeMenu = new Menu(EMenu.timeMenu);

const timesArray = await getSheetData(`${getCurrentDate()}!A:A`);

timesArray.forEach((timeArr) => {
  if (timeArr.length) {
    timeMenu
      .submenu(timeArr[0], EMenu.masterMenu, (ctx) => {
        console.log(">>", timeArr[0]);

        ctx.session.chosenTime = timeArr[0];
      })
      .row();
  }
});

timeMenu.back("⬅️ Назад");

export default timeMenu;
