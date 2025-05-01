import { PostgrestError } from "@supabase/supabase-js";
import supabaseClient from "./supabase";

export interface IProcedure {
  id: number;
  name: string;
  translation: string;
}

interface IGetAllProceduresResponse {
  procedures: IProcedure[] | null;
  error: PostgrestError | null;
}

export const getAllProcedures =
  async (): Promise<IGetAllProceduresResponse> => {
    let { data: procedures, error } = await supabaseClient
      .from("procedures")
      .select("id, name, translation");

    console.log("procedures error", error);

    return { procedures, error };
  };

// appointments

enum EAppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELED = "canceled",
}

interface IAppointment {
  id: number;
  client_id: number;
  master_id: number;
  procedure_id: number;
  status: keyof typeof EAppointmentStatus;
  date: Date;
  time_slot: string;
  procedures: IProcedure;
  masters: IMaster;
}

interface IGetAppointmentsResponse {
  appointments: IAppointment[] | null;
  error: PostgrestError | null;
}

export const getUsersAppointmentsByTelegramId = async (
  telegramId: string
): Promise<IGetAppointmentsResponse> => {
  let { data: appointments, error } = await supabaseClient
    .from("appointments")
    .select("*, procedures(translation), masters(name)")
    .eq("client_id", telegramId);

  console.log("appointments error", error);

  return { appointments, error };
};

export const getMastersAppointmentsByDay = async ({
  masterId,
  day,
}: {
  masterId: number;
  day: string;
}): Promise<IGetAppointmentsResponse> => {
  let { data: appointments, error } = await supabaseClient
    .from("appointments")
    .select("*, procedures(translation)")
    .eq("master_id", masterId)
    .eq("date", day)
    .neq("status", EAppointmentStatus.CANCELED);

  console.log("appointments error", error);

  return { appointments, error };
};

export const getAppointmentsByTimeSlot = async ({
  timeSlot,
  day,
}: {
  timeSlot: string;
  day: string;
}): Promise<IGetAppointmentsResponse> => {
  let { data: appointments, error } = await supabaseClient
    .from("appointments")
    .select("*, procedures(translation)")
    .eq("time_slot", timeSlot)
    .eq("date", day)
    .neq("status", EAppointmentStatus.CANCELED);

  console.log("appointments error", error);

  return { appointments, error };
};

// clients

interface IAddNewClientProps {
  telegramId: number;
  phoneNumber: string;
  telegramLogin: string;
  userName: string;
}

export const addNewClient = async ({
  telegramId,
  phoneNumber,
  telegramLogin,
  userName,
}: IAddNewClientProps): Promise<PostgrestError | null> => {
  const { error } = await supabaseClient
    .from("clients")
    .insert([
      {
        telegram_id: telegramId,
        telegram_login: telegramLogin,
        name: userName,
        phone: phoneNumber,
      },
    ])
    .select();

  console.log("addNewClient error", error);

  return error;
};

interface IUser {
  telegram_id: number;
  telegram_login: string;
  name: string;
  phone: string;
}

interface IGetUserByTelegramIdResponse {
  user: IUser | null;
  error: PostgrestError | null;
}

export const getUserByTelegramId = async (
  telegramId: string
): Promise<IGetUserByTelegramIdResponse> => {
  const { data: user, error } = await supabaseClient
    .from("clients")
    .select("telegram_id, telegram_login, name, phone")
    .eq("telegram_id", telegramId)
    .single();

  console.log("user error", telegramId, error);

  return { user, error };
};

// masters

export interface IMaster {
  id: number;
  name: string;
}
interface IGetAllMastersResponse {
  masters: IMaster[] | null;
  error: PostgrestError | null;
}

export const getAllMasters = async (): Promise<IGetAllMastersResponse> => {
  let { data: masters, error } = await supabaseClient
    .from("masters")
    .select("id, name");

  console.log("masters error", error);

  return { masters, error };
};

// time_slots

interface IGetAllTimeSlotsResponse {
  timeSlots:
    | {
        time: string;
      }[]
    | null;
  error: PostgrestError | null;
}

export const getAllTimeSlots = async (): Promise<IGetAllTimeSlotsResponse> => {
  const { data: timeSlots, error } = await supabaseClient
    .from("time_slots")
    .select("time");

  console.log("timeSlots error", error);

  return { timeSlots, error };
};
