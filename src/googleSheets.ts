import { google } from "googleapis";
import * as dotenv from "dotenv";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const SHEET_ID = "1-Uv79rSNolLH4UMJZPIs6KBL-TFd4MtjllYECHyJBNw";
const RANGE = "Sheet1!A3:E3"; // диапазон, откуда читаем

export async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, "../credentials.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  const rows = res.data.values;
  return rows || [];
}

export async function insertClient(date: string, time: string) {
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
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[date, time]],
    },
  });
  console.log(res.data);
  return res.data;
}
