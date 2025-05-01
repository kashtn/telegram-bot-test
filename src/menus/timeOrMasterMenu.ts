import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";

const timeOrMasterMenu = new Menu(EMenu.timeOrMasterMenu)
  .submenu("🙍🏼‍♀️ Выбрать мастера", EMenu.masterMenu)
  .row()
  .submenu("🕘 Выбрать время", EMenu.timeMenu)
  .row();

timeOrMasterMenu.back("⬅️ Назад");

export default timeOrMasterMenu;
