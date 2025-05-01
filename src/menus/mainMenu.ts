import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import supabaseClient from "../supabase";

const mainMenu = new Menu("main-menu")
  .submenu("📝 Записаться", EMenu.procedureMenu)
  .row()
  .text("📅 Мои записи", async (ctx) => {
    let { data: appointments, error } = await supabaseClient
      .from("appointments")
      .select("*, procedures(translation)")
      .eq("telegram_id", ctx.session.telegramId);

    appointments?.forEach(async (appointment, index) => {
      await ctx.reply(
        `Запись ${index + 1}: ${appointment.procedures.translation}, ${
          appointment.date
        }, ${appointment.slot_time}`
      );
    });
  })
  .row()
  .text("👩‍💼 Связаться с менеджером", (ctx) => {
    return ctx.reply(
      "Для связи с менеджером:\n☎️ +7 (XXX) XXX-XX-XX\n✉️ manager@nogotochki.ru"
    );
  })
  .row();

export default mainMenu;
