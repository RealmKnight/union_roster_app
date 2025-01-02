import type { Database } from "@/types/databasetypes";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];

export type Member = {
  id: string | null;
  first_name: string | null;
  last_name: string | null;
  pin_number: number;
  system_sen_type: Database["public"]["Enums"]["sys_seniority_type"] | null;
  engineer_date: string | null;
  date_of_birth: string | null;
  zone: Database["public"]["Enums"]["zone"] | null;
  prior_vac_sys: number | null;
  status: string | null;
};
