import { Member } from "@/types/member";

export function combineWCArrays(
  wcmembers: Member[],
  dmirmembers: Member[],
  dwpmembers: Member[],
  sys1members: Member[],
  ejemembers: Member[],
  sys2members: Member[]
) {
  const combinedArray = [];
  combinedArray.push(...wcmembers);
  const patternArray = [];
  while (dmirmembers.length > 0 || dwpmembers.length > 0) {
    for (let i = 0; i < 6 && (dmirmembers.length > 0 || dwpmembers.length > 0); i++) {
      for (let j = 0; j < 2 && dmirmembers.length > 0; j++) {
        patternArray.push(dmirmembers.shift()!);
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift()!);
      }
    }
    for (let i = 0; i < 4 && (dmirmembers.length > 0 || dwpmembers.length > 0); i++) {
      if (dmirmembers.length > 0) {
        patternArray.push(dmirmembers.shift()!);
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift()!);
      }
    }
  }
  combinedArray.push(...patternArray);
  combinedArray.push(...sys1members);
  combinedArray.push(...ejemembers);
  combinedArray.push(...sys2members);
  return combinedArray;
}

export function combineDMIRArrays(
  wcmembers: Member[],
  dmirmembers: Member[],
  dwpmembers: Member[],
  sys1members: Member[],
  ejemembers: Member[],
  sys2members: Member[]
) {
  const combinedArray = [];

  // Add all dmirmembers
  combinedArray.push(...dmirmembers);

  // Create a new array for the pattern
  const patternArray = [];

  // Apply the new pattern
  while (wcmembers.length > 0 || dwpmembers.length > 0) {
    // 6 WC and 1 DWP, repeated 9 times
    for (let i = 0; i < 9 && (wcmembers.length > 0 || dwpmembers.length > 0); i++) {
      for (let j = 0; j < 6 && wcmembers.length > 0; j++) {
        patternArray.push(wcmembers.shift()!);
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift()!);
      }
    }

    // 5 WC and 1 DWP, once
    if (wcmembers.length > 0 || dwpmembers.length > 0) {
      for (let j = 0; j < 5 && wcmembers.length > 0; j++) {
        patternArray.push(wcmembers.shift()!);
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift()!);
      }
    }
  }

  combinedArray.push(...patternArray);
  combinedArray.push(...sys1members);
  combinedArray.push(...ejemembers);
  combinedArray.push(...sys2members);
  return combinedArray;
}

export function combineDWPArrays(
  wcmembers: Member[],
  dmirmembers: Member[],
  dwpmembers: Member[],
  sys1members: Member[],
  ejemembers: Member[],
  sys2members: Member[]
) {
  const combinedArray = [];

  // Add all dwpmembers
  combinedArray.push(...dwpmembers);

  // Create a new array for the pattern
  const patternArray = [];

  // Apply the new pattern
  while (wcmembers.length > 0 || dmirmembers.length > 0) {
    // 4 WC and 1 DMIR, repeated 7 times
    for (let i = 0; i < 7 && (wcmembers.length > 0 || dmirmembers.length > 0); i++) {
      for (let j = 0; j < 4 && wcmembers.length > 0; j++) {
        patternArray.push(wcmembers.shift()!);
      }
      if (dmirmembers.length > 0) {
        patternArray.push(dmirmembers.shift()!);
      }
    }

    // 3 WC and 1 DMIR, repeated 3 times
    for (let i = 0; i < 3 && (wcmembers.length > 0 || dmirmembers.length > 0); i++) {
      for (let j = 0; j < 3 && wcmembers.length > 0; j++) {
        patternArray.push(wcmembers.shift()!);
      }
      if (dmirmembers.length > 0) {
        patternArray.push(dmirmembers.shift()!);
      }
    }
  }

  combinedArray.push(...patternArray);
  combinedArray.push(...sys1members);
  combinedArray.push(...ejemembers);
  combinedArray.push(...sys2members);
  return combinedArray;
}

export function combineEJEArrays(
  wcmembers: Member[],
  dmirmembers: Member[],
  dwpmembers: Member[],
  sys1members: Member[],
  ejemembers: Member[],
  sys2members: Member[]
) {
  const roster = [];

  // Add all ejemembers
  roster.push(...ejemembers);

  // Add wcmembers, dmirmembers, and dwpmembers in the specified pattern 7 WC, 2 DMIR, and 1 DWP eng
  while (wcmembers.length > 0 || dmirmembers.length > 0 || dwpmembers.length > 0) {
    if (wcmembers.length >= 7) {
      for (let i = 0; i < 7; i++) {
        roster.push(wcmembers.shift()!);
      }
    } else {
      // Add remaining wcmembers
      while (wcmembers.length > 0) {
        roster.push(wcmembers.shift()!);
      }
    }

    if (dmirmembers.length >= 2) {
      roster.push(dmirmembers.shift()!);
      roster.push(dmirmembers.shift()!);
    } else {
      // Add remaining dmirmembers
      while (dmirmembers.length > 0) {
        roster.push(dmirmembers.shift()!);
      }
    }

    if (dwpmembers.length > 0) {
      roster.push(dwpmembers.shift()!);
    }
  }

  // Add remaining arrays
  roster.push(...sys1members);
  roster.push(...sys2members);

  return roster;
}
