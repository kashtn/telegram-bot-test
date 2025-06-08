import { Menu } from "@grammyjs/menu";
import { EMenu } from "./EMenu";

import { getCurrentDate } from "../utils/getCurrentDate";
import { getAllTimeSlots, getMastersAppointmentsByDay } from "../api";
import { convertToDate } from "../utils/convertToDate";
import { TContext } from "../bot";

const timeMenu = new Menu<TContext>(EMenu.timeMenu).dynamic(async (ctx, range) => {
  const { timeSlots, error: timeSlotsError } = await getAllTimeSlots();
  const timeSlotsArray = timeSlots?.map((timeSlot) => timeSlot.time) || [];

  const { day, time, master, procedureId } = ctx.session.appointment;

  let freeTimeSlots: string[] = [...timeSlotsArray];
  console.log("debugger>>>>>>>>>>>>>>>>>", ctx.session.appointment.master);

  // если мастер уже выбран
  if (ctx.session.appointment.master?.id) {
    const { appointments, error } = await getMastersAppointmentsByDay({
      masterId: ctx.session.appointment.master.id,
      day: convertToDate(ctx.session.appointment.day),
    });

    console.log("master appointments", appointments);

    appointments?.forEach((appointment) => {
      freeTimeSlots = freeTimeSlots.filter(
        (timeSlot) => appointment.time_slot !== timeSlot
      );
    });

    freeTimeSlots.forEach((timeSlot) => {
      range
        .submenu(timeSlot, EMenu.confirmMenu, async (ctx) => {
          console.log(">>", timeSlot);

          ctx.session.appointment.time = timeSlot;

          await ctx.editMessageText(
            `${ctx.session.allProcedures[procedureId].translation} на ${day} в ${timeSlot}. Мастер: ${master.name}`
          );
        })
        .row();
    });
  } else {
    freeTimeSlots = [...timeSlotsArray];
    console.log("no master", freeTimeSlots);

    freeTimeSlots.forEach((timeSlot) => {
      range
        .submenu(timeSlot, EMenu.masterMenu, async (ctx) => {
          console.log(">>", timeSlot);

          ctx.session.appointment.time = timeSlot;

          await ctx.editMessageText("Выберите мастера:");
        })
        .row();
    });
  }

  range.back("⬅️ Назад", (ctx) => {
    ctx.session.appointment.time = null;
    ctx.session.appointment.master = null;
  });
});

export default timeMenu;
