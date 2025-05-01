import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import weekMenu from "./weekMenu";
import supabaseClient from "../supabase";

const procedureMenu = new Menu(EMenu.procedureMenu).dynamic(
  async (ctx, range) => {
    let { data: procedures, error } = await supabaseClient
      .from("procedures")
      .select("id, name, translation");

    console.log("procedures error", error);

    procedures?.map((procedure) => {
      range
        .text(procedure.translation, async (ctx) => {
          await ctx.deleteMessage();

          await ctx.reply("Выберите дату:", { reply_markup: weekMenu });
          ctx.session.chosenProcedure = procedure.id;
        })
        .row();
    });

    range.back("⬅️ Назад");
  }
);

export default procedureMenu;
