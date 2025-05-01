import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import weekMenu from "./weekMenu";
import { getAllProcedures, IProcedure } from "../api";

const procedureMenu = new Menu(EMenu.procedureMenu).dynamic(
  async (ctx, range) => {
    let { procedures, error } = await getAllProcedures();

    console.log("ctxctxctxctxctxctxctx", ctx.session);

    ctx.session.allProcedures = procedures?.reduce((acc, procedure) => {
      acc[procedure.id] = { ...procedure };
      return acc;
    }, {} as Record<string, IProcedure>);

    procedures?.map((procedure) => {
      range
        .submenu(procedure.translation, EMenu.weekMenu, async (ctx) => {
          ctx.session.appointment.procedureId = procedure.id;

          await ctx.editMessageText("Выберите неделю:");
        })
        .row();
    });

    range.back("⬅️ Назад");
  }
);

export default procedureMenu;
