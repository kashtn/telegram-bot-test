import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";
// import { getSheetData } from "../googleSheets";
import { getCurrentDate } from "../utils/getCurrentDate";
import { getAllMasters, getAppointmentsByTimeSlot, IMaster } from "../api";
import { time } from "console";
import { convertToDate } from "../utils/convertToDate";

const masterMenu = new Menu(EMenu.masterMenu).dynamic(async (ctx, range) => {
  const { masters, error } = await getAllMasters();
  console.log("mastersFromDB", masters);
  let freeMasters: IMaster[] = [...(masters || [])];

  const { day, time, procedureId } = ctx.session.appointment;

  if (ctx.session.appointment.time) {
    const { appointments, error } = await getAppointmentsByTimeSlot({
      timeSlot: ctx.session.appointment.time,
      day: convertToDate(ctx.session.appointment.day),
    });

    console.log("busy appointments", appointments);

    appointments?.forEach((appointment) => {
      freeMasters =
        freeMasters?.filter((master) => appointment.master_id !== master.id) ||
        [];
      console.log("freeMasters==", freeMasters);
    });

    if (!freeMasters.length) {
      range.text("Нет свободных мастеров на это время");
    } else {
      freeMasters?.forEach((master) => {
        range
          .submenu(master.name, EMenu.confirmMenu, async (ctx) => {
            ctx.session.appointment.master = master;

            await ctx.editMessageText(
              `${ctx.session.allProcedures[procedureId].translation} на ${day} в ${time}. Мастер: ${master.name}`
            );
          })
          .row();
      });
    }
  } else {
    masters?.forEach((master) => {
      range
        .submenu(master.name, EMenu.timeMenu, async (ctx) => {
          ctx.session.appointment.master = master;

          await ctx.editMessageText("Выберите время:");
        })
        .row();
    });
  }

  range.back("⬅️ Назад", (ctx) => {
    ctx.session.appointment.master = null;
    ctx.session.appointment.time = null;
  });
});

export default masterMenu;
