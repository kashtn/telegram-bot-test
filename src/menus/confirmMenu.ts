import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import mainMenu from "./mainMenu";
import supabaseClient from "../supabase";
import { convertToDate } from "../utils/convertToDate";
import { TContext } from "../bot";

const confirmMenu = new Menu<TContext>(EMenu.confirmMenu).dynamic(
  async (ctx, range) => {
    const { day, time, master, procedureId } = ctx.session.appointment;

    // await ctx.editMessageText(
    //   `${ctx.session.allProcedures[procedureId].translation} на ${day} в ${time}. Мастер: ${master.name}`
    // );

    range.row();
    range.text("✅ Подтвердить", async (ctx) => {
      const { data, error } = await supabaseClient
        .from("appointments")
        .insert([
          {
            client_id: ctx.session.user.telegramId,
            master_id: master.id,
            date: convertToDate(day),
            time_slot: time,
            procedure_id: procedureId,
          },
        ])
        .select();

      console.log("error", error);

      if (error) {
        await ctx.reply(`Ошибка при подтверждени записи`);
      } else {
        await ctx.deleteMessage();
        await ctx.reply(
          `Вы подтвердили запись: ${ctx.session.allProcedures[procedureId].translation} на ${day} в ${time}. Мастер: ${master.name}`
        );
        await ctx.reply("Главное меню:", { reply_markup: mainMenu });
        ctx.session = {
          currentDayTable: [],
          user: {},
          appointment: { master: {} },
        };
      }
    });
    range.row();
    range.back("⬅️ Назад");
  }
);

export default confirmMenu;
