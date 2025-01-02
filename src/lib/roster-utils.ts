import { Member } from "@/types/member";
import { combineWCArrays, combineDMIRArrays, combineDWPArrays, combineEJEArrays } from "@/lib/roster-calculations";

export const sortByPriorVacSys = (a: Member, b: Member) => {
  if (a.prior_vac_sys === null || b.prior_vac_sys === null) {
    return 0;
  }
  if (typeof a.prior_vac_sys === "number" && typeof b.prior_vac_sys === "number") {
    return a.prior_vac_sys - b.prior_vac_sys;
  }
  return String(a.prior_vac_sys).localeCompare(String(b.prior_vac_sys));
};

export const getRosterMembers = (members: Member[], type: string) => {
  const activeMembers = members.filter((m) => m.status === "ACTIVE");

  const wcmembers = activeMembers.filter((m) => m.system_sen_type === "WC").sort(sortByPriorVacSys);
  const dmirmembers = activeMembers.filter((m) => m.system_sen_type === "DMIR").sort(sortByPriorVacSys);
  const dwpmembers = activeMembers.filter((m) => m.system_sen_type === "DWP").sort(sortByPriorVacSys);
  const sys1members = activeMembers.filter((m) => m.system_sen_type === "SYS1").sort(sortByPriorVacSys);
  const ejemembers = activeMembers.filter((m) => m.system_sen_type === "EJ&E").sort(sortByPriorVacSys);
  const sys2members = activeMembers.filter((m) => m.system_sen_type === "SYS2").sort(sortByPriorVacSys);

  switch (type) {
    case "WC":
      return combineWCArrays(wcmembers, dmirmembers, dwpmembers, sys1members, ejemembers, sys2members);
    case "DMIR":
      return combineDMIRArrays(wcmembers, dmirmembers, dwpmembers, sys1members, ejemembers, sys2members);
    case "DWP":
      return combineDWPArrays(wcmembers, dmirmembers, dwpmembers, sys1members, ejemembers, sys2members);
    case "EJ&E":
      return combineEJEArrays(wcmembers, dmirmembers, dwpmembers, sys1members, ejemembers, sys2members);
    default:
      return combineWCArrays(wcmembers, dmirmembers, dwpmembers, sys1members, ejemembers, sys2members);
  }
};
