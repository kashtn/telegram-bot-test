import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://okpalhncdhxuoenolmzn.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let { data: appointments, error } = await supabase
  .from("appointments")
  .select("*");

console.log("appointments", appointments);

export default supabase;