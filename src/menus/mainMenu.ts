import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
import { getUsersAppointmentsByTelegramId } from "../api";

const mainMenu = new Menu("main-menu")
  .submenu("📝 Записаться", EMenu.procedureMenu, async (ctx) => {
    await ctx.editMessageText("Выберите процедуру:");
  })
  .row()
  .text("📅 Мои записи", async (ctx) => {
    let { appointments, error } = await getUsersAppointmentsByTelegramId(
      String(ctx.session.user.telegramId)
    );

    appointments?.forEach(async (appointment, index) => {
      await ctx.reply(
        `Запись ${index + 1}: ${appointment.procedures.translation}, ${
          appointment.date
        }, ${appointment.time_slot}, Mастер: ${appointment.masters.name}`
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
