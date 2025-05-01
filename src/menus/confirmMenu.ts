import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import mainMenu from "./mainMenu";
import { insertClient, updateSheet } from "../googleSheets";

const confirmMenu = new Menu(EMenu.confirmMenu).dynamic((ctx, range) => {
  const { chosenDay, chosenTime, chosenMaster, chosenProcess } = ctx.session;

  range.text(
    `${chosenProcess} на ${chosenDay} в ${chosenTime}. Мастер: ${chosenMaster}`
  );
  range.row();
  range.text("✅ Подтвердить", async (ctx) => {
    console.log("=======", ctx.session.currentDayTable);
    const masterIndex = ctx.session.currentDayTable[0].indexOf(
      ctx.session.chosenMaster
    );
    console.log("masterIndex", masterIndex);
    const timeIndex = ctx.session.currentDayTable.findIndex(
      (row: string) => row[0] === ctx.session.chosenTime
    );
    console.log("timeIndex", timeIndex);
    ctx.session.currentDayTable[timeIndex][masterIndex] =
      ctx.session.phoneNumber;
    console.log("ctx.session.currentDayTable", ctx.session.currentDayTable);

    const letter = columnIndexToLetter(masterIndex);

    updateSheet(
      `${ctx.session.chosenDay}.25!${letter}${timeIndex+1}`,
      ctx.session.phoneNumber
    );

    try {
      await ctx.deleteMessage(); // удаляем старое меню
      await ctx.reply(
        `Вы подтвердили запись: ${chosenProcess} на ${chosenDay} в ${chosenTime}. Мастер: ${chosenMaster}`
      );
      await ctx.reply("Главное меню:", { reply_markup: mainMenu });
    } catch (error) {
      console.error("Ошибка при подтверждении:", error);
    }
  });
  range.row();
});

confirmMenu.back("⬅️ Назад");

export default confirmMenu;

function columnIndexToLetter(index: number) {
  let columnLetter = "";
  while (index >= 0) {
    columnLetter =
      String.fromCharCode((index % 26) + "A".charCodeAt(0)) + columnLetter;
    index = Math.floor(index / 26) - 1;
  }
  return columnLetter;
}
