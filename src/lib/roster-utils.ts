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

// Filter out members with misc_notes for OSL
const filterMembersForOSL = (members: Member[]) => {
  return members.filter((member) => !member.misc_notes);
};

export const getRosterMembers = (members: Member[], type: string) => {
  // For OSL rosters, filter out members with misc_notes first
  const filteredMembers = type.toLowerCase().startsWith("osl-") ? filterMembersForOSL(members) : members;

  const wcmembers = filteredMembers.filter((m) => m.system_sen_type === "WC").sort(sortByPriorVacSys);
  const dmirmembers = filteredMembers.filter((m) => m.system_sen_type === "DMIR").sort(sortByPriorVacSys);
  const dwpmembers = filteredMembers.filter((m) => m.system_sen_type === "DWP").sort(sortByPriorVacSys);
  const sys1members = filteredMembers.filter((m) => m.system_sen_type === "SYS1").sort(sortByPriorVacSys);
  const ejemembers = filteredMembers.filter((m) => m.system_sen_type === "EJ&E").sort(sortByPriorVacSys);
  const sys2members = filteredMembers.filter((m) => m.system_sen_type === "SYS2").sort(sortByPriorVacSys);

  // Remove the OSL- prefix if present for the switch statement
  const rosterType = type.replace(/^osl-/i, "").toUpperCase();

  switch (rosterType) {
    case "WC":
      return combineWCArrays(wcmembers, dmirmembers, dwpmembers, sys1members, ejemembers, sys2members);
    case "DMIR":
      return combineDMIRArrays(wcmembers, dmirmembers, dwpmembers, sys1members, ejemembers, sys2members);
    case "DWP":
      return combineDWPArrays(wcmembers, dmirmembers, dwpmembers, sys1members, ejemembers, sys2members);
    case "EJ&E":
      return combineEJEArrays(wcmembers, dmirmembers, dwpmembers, sys1members, ejemembers, sys2members);
    default:
      // Log the roster type to help with debugging
      console.log("Unrecognized roster type:", rosterType);
      return members; // Return unmodified list instead of defaulting to WC roster
  }
};
