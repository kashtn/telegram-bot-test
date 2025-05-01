import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import mainMenu from "./mainMenu";
import { insertClient, updateSheet } from "../googleSheets";
import supabaseClient from "../supabase";
import { convertToUnix } from "../utils/convertToUnix";
import { convertToDate } from "../utils/convertToDate";

const confirmMenu = new Menu(EMenu.confirmMenu).dynamic((ctx, range) => {
  const { chosenDay, chosenTime, chosenMaster, chosenProcedure } = ctx.session;

  range.text(
    `${chosenProcedure} на ${chosenDay} в ${chosenTime}. Мастер: ${chosenMaster}`
  );
  range.row();
  range.text("✅ Подтвердить", async (ctx) => {
    const masterIndex = ctx.session.currentDayTable[0].indexOf(
      ctx.session.chosenMaster
    );

    const timeIndex = ctx.session.currentDayTable.findIndex(
      (row: string) => row[0] === ctx.session.chosenTime
    );

    ctx.session.currentDayTable[timeIndex][masterIndex] =
      ctx.session.phoneNumber;

    const letter = columnIndexToLetter(masterIndex);

    updateSheet(
      `${ctx.session.chosenDay}.25!${letter}${timeIndex + 1}`,
      `${ctx.session.fullName}(${
        ctx.session.login
      }) - ${ctx.session.phoneNumber.replace(/.(?=.{4})/g, "*")}`
    );

    const { data, error } = await supabaseClient
      .from("appointments")
      .insert([
        {
          telegram_id: ctx.session.telegramId,
          master_id: chosenMaster[chosenMaster.length - 1],
          date: convertToDate(chosenDay),
          slot_time: chosenTime,
          procedure_id: "manikur",
        },
      ])
      .select();

    console.log("inserted data", data);
    console.log("error", error);

    try {
      await ctx.deleteMessage(); // удаляем старое меню
      await ctx.reply(
        `Вы подтвердили запись: ${chosenProcedure} на ${chosenDay} в ${chosenTime}. Мастер: ${chosenMaster}`
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
