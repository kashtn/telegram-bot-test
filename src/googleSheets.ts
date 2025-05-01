import { google } from "googleapis";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const RANGE = "Sheet1!A3:E3"; // диапазон, откуда читаем

const getAuth = async () => {
  let auth;

  if (process.env.GOOGLE_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  } else {
    const credentialsPath = path.resolve(__dirname, "../credentials.json");

    if (!fs.existsSync(credentialsPath)) {
      throw new Error(
        "credentials.json not found and GOOGLE_CREDENTIALS not set"
      );
    }

    auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  return auth;
};

export async function getSheetData(range: string) {
  const auth = await getAuth();
  const client = await auth.getClient();

  const sheets = google.sheets({ version: "v4", auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range,
  });

  const rows = res.data.values;
  return rows || [];
}

export async function insertClient(range: string, date: string, time: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, "../credentials.json"),
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  //   await sheets.spreadsheets.values.
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[date, time]],
    },
  });
  console.log(res.data);
  return res.data;
}

export async function updateSheet(range: string, payload: string) {
  const auth = await getAuth();
  const client = await auth.getClient();

  const sheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.SHEET_ID; // Замените вашим идентификатором таблицы

  const values = [[payload]];

  const resource = {
    values,
  };

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource,
    });
    console.log(`${response.data.updatedCells} ячеек было обновлено.`);
  } catch (err) {
    console.error("Ошибка обновления таблицы:", err);
  }
}
