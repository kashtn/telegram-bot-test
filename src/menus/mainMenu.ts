import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";

const mainMenu = new Menu("main-menu")
  .submenu("📝 Записаться", EMenu.processMenu)
  .row()
  .text("📅 Мои записи", async (ctx) => {
    return ctx.reply(`Ваши записи:`);
  })
  .row()
  .text("👩‍💼 Связаться с менеджером", (ctx) => {
    return ctx.reply(
      "Для связи с менеджером:\n☎️ +7 (XXX) XXX-XX-XX\n✉️ manager@nogotochki.ru"
    );
  })
  .row();

export default mainMenu;
