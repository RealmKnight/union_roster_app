# Product Requirements Document (PRD)

## Project Overview

The goal of this project is to build a responsive web application that enables users to view and download union rosters broken down by prior rights seniority. The application will utilize a Supabase database to manage data and provide functionality for admin users to manage rosters and perform calculations. It will support downloading rosters in PDF format and will include theming options (light/dark mode) with potential future color schemes.

## Functional Requirements

### 1. Authentication and Authorization

#### Login System

- Admin users will authenticate via email/password
- Admin accounts will be pre-populated in the database
- Only admin users can:
  - Add/remove other admin users
  - Trigger roster calculations
  - Edit member information

#### Protected Routes

- The `/admin` route and roster calculation endpoints must be restricted to admin users

### 2. Rosters Management

#### Database Integration

- Fetch rosters from the Supabase `members` table
- The table will have the following fields:
  - `Name` (First and Last)
  - `PIN Number`
  - `Prior Rights Seniority Designation` (WC, DMIR, DWP, SYS1, EJ&E, SYS2)
  - `Engineer Date`
  - `DOB`
  - `Current Zone` (Zones 1-10)
  - `Desired Home Zone` (if any)
  - `Status` (Active, Inactive, Pending, Retired, Set-Back)
  - `Current Rank` (Seniority system ranking)

#### Roster Calculation

- Implement roster allocation based on provided patterns for each prior rights group:
  - **WC**: Combines members in a specific pattern (example code provided)
  - **DWP**: Combines members with different allocation rules (example code provided)
  - **DMIR**: Combines members with its own allocation pattern (example code provided)
  - **EJ&E**: Combines members with unique logic (example code provided)

#### Roster Display

- Display rosters in a responsive table format with sortable columns
- Admin users can edit member information via a modal or inline editing

### 3. PDF Export

- Use `@react-pdf/renderer` to generate PDF downloads of rosters
- The PDF table should mirror the web UI table structure:
  - `Name`
  - `PIN Number`
  - `Prior Rights Seniority Designation`
  - `Engineer Date`
  - `DOB`
  - `Current Zone`
  - `Desired Home Zone`
  - `Status`

### 4. Theming and Accessibility

#### Light/Dark Mode

- Implement a toggle to switch themes
- Future-proof with a structure for additional color schemes

#### Responsive Design

- Ensure the app is optimized for both desktop and mobile devices

### 5. Home Page and Navigation

#### Navigation Bar

- Links:
  - Home
  - Rosters
  - Admin (visible only to admin users)
  - Links/Tools (links to bylaws, constitution, and current contract)
  - Sign In

### 6. Deployment

- Deploy the application on Vercel or Coolify
- Ensure it integrates seamlessly with the self-hosted Supabase backend

## Non-Functional Requirements

### 1. Performance

- Queries for rosters must execute within 2 seconds
- PDF generation should not exceed 5 seconds

### 2. Scalability

- Ensure the database and app can handle up to 10,000 members

### 3. Security

- Use HTTPS for all communication
- Implement secure password storage for admin credentials

## File Structure

```
union-roster-app
├── .gitignore
├── env.local
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public
│   ├── assets
├── src
│   ├── app
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── admin
│   │   ├── rosters
│   │   └── links
│   ├── components
│   │   ├── ui
│   │   │   ├── button.tsx
│   │   │   ├── table.tsx
│   │   │   └── modal.tsx
│   ├── hooks
│   │   └── use-toast.ts
│   ├── lib
│   │   └── utils.ts
│   ├── utils
│   │   └── supabase
│   │       ├── client.ts
│   │       └── server.ts
```

## Provided Code Snippets

### Roster Calculation Examples

#### WC

```typescript
export function combineWCArrays(
  wcmembers: any[],
  dmirmembers: any[],
  dwpmembers: any[],
  sys1members: any[],
  ejemembers: any[],
  sys2members: any[]
) {
  const combinedArray = [];
  combinedArray.push(...wcmembers);
  const patternArray = [];
  while (dmirmembers.length > 0 || dwpmembers.length > 0) {
    for (let i = 0; i < 6 && (dmirmembers.length > 0 || dwpmembers.length > 0); i++) {
      for (let j = 0; j < 2 && dmirmembers.length > 0; j++) {
        patternArray.push(dmirmembers.shift());
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift());
      }
    }
    for (let i = 0; i < 4 && (dmirmembers.length > 0 || dwpmembers.length > 0); i++) {
      if (dmirmembers.length > 0) {
        patternArray.push(dmirmembers.shift());
      }
      if (dwpmembers.length > 0) {
        patternArray.push(dwpmembers.shift());
      }
    }
  }
  combinedArray.push(...patternArray);
  combinedArray.push(...sys1members);
  combinedArray.push(...ejemembers);
  combinedArray.push(...sys2members);
  return combinedArray;
}
```

#### DWP

```typescript
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

#### DMIR

```typescript
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

#### EJ&E

```typescript
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

### PDF Generation Example

```typescript
import React from "react";
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

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
      <Text style={styles.title}>Union Roster</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Name</Text>
          <Text style={styles.tableCell}>PIN</Text>
          <Text style={styles.tableCell}>Prior Rights</Text>
          <Text style={styles.tableCell}>Status</Text>
        </View>
        {data.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.name}</Text>
            <Text style={styles.tableCell}>{row.pin}</Text>
            <Text style={styles.tableCell}>{row.rights}</Text>
            <Text style={styles.tableCell}>{row.status}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
```
