export type Member = {
  id: string;
  name: string;
  pin_number: string;
  system_sen_type: "WC" | "DMIR" | "DWP" | "SYS1" | "EJ&E" | "SYS2";
  engineer_date: string;
  dob: string;
  current_zone: number;
  desired_home_zone?: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "RETIRED" | "SET-BACK";
  prior_vac_sys: number | null;
};
