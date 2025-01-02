# Project Overview

You are building a web application that allows users to see the Rosters of their local union broken down by prior rights seniority. The Rosters are stored in a supabase database and the application will query the database to get the data. The rosters will also be able to be downloaded in pdf format oince they are calculated.

# Requirements

- The application must be built using Next.js 15, shadcn, lucide icons, supabase, react-pdf/renderer, and Tailwind CSS.
- The application must be responsive and look good on both mobile and desktop.
- The application must be able to query the database to get the data.
- The application must be able to download the rosters in pdf format.
- The application will also have a login system that will allow admin users to login and manage the rosters. these users will be pre-populated in the database and will have the ability to add and remove other admin users.
- admin users are the only ones able to trigger the rosters to be calculated/re-calculated.
- The application will have theming to allow switching from light to dark mode and potentially differnet color schemes in the future.
- The application will also have the current CBA version available to download as a pdf.
- The application must be able to be deployed to Vercel/Coolify.
- the home page should have a navigation bar with the following links:

  - Home
  - Rosters
  - Admin (admin only)
  - Links/Tools (links to the bylaws, constitution, and current contract)
  - Sign In

- the app should have a page that allows users to view the rosters of their union by prior rights. Prior rights are the following:

  - WC
  - DWP
  - DMIR
  - EJ&E
  - Full Roster (including In-Active members)

- the app will appropriately calculate the rosters based on the rules for each prior rights group.
  examples;
  - WC: example code snippet with correct allocation of members to the WC prior rights group:

```ts
export function combineWCArrays(
  wcmembers: any[],
  dmirmembers: any[],
  dwpmembers: any[],
  sys1members: any[],
  ejemembers: any[],
  sys2members: any[]
) {
  const combinedArray = [];

  // Add all wcmembers
  combinedArray.push(...wcmembers);

  // Create a new array for the pattern
  const patternArray = [];

  // Apply the new pattern
  while (dmirmembers.length > 0 || dwpmembers.length > 0) {
    // 2 DMIR and 1 DWP, repeated 6 times
    for (let i = 0; i < 6 && (dmirmembers.length > 0 || dwpmembers.length > 0); i++) {
      for (let j = 0; j < 2 && dmirmembers.length > 0; j++) {
        patternArray.push(dmirmembers.shift());
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift());
      }
    }

    // 1 DMIR and 1 DWP, repeated 4 times
    for (let i = 0; i < 4 && (dmirmembers.length > 0 || dwpmembers.length > 0); i++) {
      if (dmirmembers.length > 0) {
        patternArray.push(dmirmembers.shift());
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift());
      }
    }
  }

  // Add the pattern array to the combined array
  combinedArray.push(...patternArray);

  // Add remaining arrays
  combinedArray.push(...sys1members);
  combinedArray.push(...ejemembers);
  combinedArray.push(...sys2members);

  return combinedArray;
}
```

- DWP: example code snippet with correct allocation of members to the DWP prior rights group:

```ts
export function combineDWPArrays(
  wcmembers: any[],
  dmirmembers: any[],
  dwpmembers: any[],
  sys1members: any[],
  ejemembers: any[],
  sys2members: any[]
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
        patternArray.push(wcmembers.shift());
      }
      if (dmirmembers.length > 0) {
        patternArray.push(dmirmembers.shift());
      }
    }

    // 3 WC and 1 DMIR, repeated 3 times
    for (let i = 0; i < 3 && (wcmembers.length > 0 || dmirmembers.length > 0); i++) {
      for (let j = 0; j < 3 && wcmembers.length > 0; j++) {
        patternArray.push(wcmembers.shift());
      }
      if (dmirmembers.length > 0) {
        patternArray.push(dmirmembers.shift());
      }
    }
  }

  // Add the pattern array to the combined array
  combinedArray.push(...patternArray);

  // Add remaining arrays
  combinedArray.push(...sys1members);
  combinedArray.push(...ejemembers);
  combinedArray.push(...sys2members);

  return combinedArray;
}
```

- DMIR: example code snippet with correct allocation of members to the DMIR prior rights group:

```ts
export function combineDMIRArrays(
  wcmembers: any[],
  dmirmembers: any[],
  dwpmembers: any[],
  sys1members: any[],
  ejemembers: any[],
  sys2members: any[]
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
        patternArray.push(wcmembers.shift());
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift());
      }
    }

    // 5 WC and 1 DWP, once
    if (wcmembers.length > 0 || dwpmembers.length > 0) {
      for (let j = 0; j < 5 && wcmembers.length > 0; j++) {
        patternArray.push(wcmembers.shift());
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift());
      }
    }
  }

  // Add the pattern array to the combined array
  combinedArray.push(...patternArray);

  // Add remaining arrays
  combinedArray.push(...sys1members);
  combinedArray.push(...ejemembers);
  combinedArray.push(...sys2members);

  return combinedArray;
}
```

- EJ&E: example code snippet with correct allocation of members to the EJ&E prior rights group:

```ts
export function combineEJEArrays(
  wcmembers: any[],
  dmirmembers: any[],
  dwpmembers: any[],
  sys1members: any[],
  ejemembers: any[],
  sys2members: any[]
) {
  const roster = [];

  // Add all ejemembers
  roster.push(...ejemembers);

  // Add wcmembers, dmirmembers, and dwpmembers in the specified pattern 7 WC, 2 DMIR, and 1 DWP eng
  while (wcmembers.length > 0 || dmirmembers.length > 0 || dwpmembers.length > 0) {
    if (wcmembers.length >= 7) {
      roster.push(wcmembers.shift());
      roster.push(wcmembers.shift());
      roster.push(wcmembers.shift());
      roster.push(wcmembers.shift());
      roster.push(wcmembers.shift());
      roster.push(wcmembers.shift());
      roster.push(wcmembers.shift());
    } else {
      // Add remaining wcmembers
      while (wcmembers.length > 0) {
        roster.push(wcmembers.shift());
      }
    }

    if (dmirmembers.length >= 2) {
      roster.push(dmirmembers.shift());
      roster.push(dmirmembers.shift());
    } else {
      // Add remaining dmirmembers
      while (dmirmembers.length > 0) {
        roster.push(dmirmembers.shift());
      }
    }

    if (dwpmembers.length > 0) {
      roster.push(dwpmembers.shift());
    }
  }

  // Add remaining arrays
  roster.push(...sys1members);
  roster.push(...sys2members);

  return roster;
}
```

# Database

The database is a supabase database that is self hosted. The table that contains the members of the union is called "members".

# Rosters

The rosters will be separated by prior rights seniority. The rosters will be displayed in a table format with the following columns:

- Name (First and Last)
- PIN Number
- Prior Rights Seniority Designation (WC, DMIR, DWP, SYS1, EJ&E, SYS2)
- Engineer Date
- DOB
- Current Seniority Zone (Zones 1-10)
- Desired Home Zone (if any)
- Status (Active, Inactive, Pending, Retired, Set-Back)
- Current Rank in the seniority system

each row will be a card with the members information and the card will be clickable by anyone to bring up that members full information. Logged in admins will have the ability to edit the members information.

# PDF Rosters

The PDF rosters will be generated using react-pdf/renderer. The PDF will be a table format with the following columns:

- Name (First and Last)
- PIN Number
- Prior Rights Seniority Designation (WC, DMIR, DWP, SYS1, EJ&E, SYS2)
- Engineer Date
- DOB
- Current Seniority Zone (Zones 1-10)
- Desired Home Zone (if any)
- Status (Active, Inactive, Pending, Retired, Set-Back)

example code snippet for pdf generation:

```ts
import React from "react";
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20 },
  table: { display: "table", width: "100%", borderStyle: "solid", borderWidth: 1 },
  tableRow: { flexDirection: "row" },
  tableHeader: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
  tableCell: { width: "25%", borderStyle: "solid", borderWidth: 1, padding: 5 },
});

const RosterPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Team Roster</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Name</Text>
          <Text style={styles.tableCell}>Position</Text>
          <Text style={styles.tableCell}>Contact</Text>
          <Text style={styles.tableCell}>Status</Text>
        </View>
        {data.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.name}</Text>
            <Text style={styles.tableCell}>{row.position}</Text>
            <Text style={styles.tableCell}>{row.contact}</Text>
            <Text style={styles.tableCell}>{row.status}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const RosterDownloadButton = ({ data }) => (
  <PDFDownloadLink document={<RosterPDF data={data} />} fileName="team-roster.pdf">
    {({ loading }) => <Button disabled={loading}>{loading ? "Generating PDF..." : "Download PDF"}</Button>}
  </PDFDownloadLink>
);

export default RosterDownloadButton;
```
