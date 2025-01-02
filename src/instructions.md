# Project Overview

You are building a web application that allows users to see the Rosters of their local union broken down by prior rights seniority. The Rosters are stored in a supabase database and the application will query the database to get the data. The rosters will also be able to be downloaded in pdf format oince they are calculated.

# Requirements

- The application must be built using Next.js 15, shadcn, lucide icons, supabase, and Tailwind CSS.
- The application must be responsive and look good on both mobile and desktop.
- The application must be able to query the database to get the data.
- The application must be able to download the rosters in pdf format.
- The application will also have a login system that will allow admin users to login and manage the rosters. these users will be pre-populated in the database and will have the ability to add and remove other admin users.
- admin users are the only ones able to trigger the rosters to be calculated/re-calculated.
- The application will have theming to allow switching from light to dark mode and potentially differnet color schemes in the future.
- The application will also have the current CBA version available to download as a pdf.
- The application must be able to be deployed to Vercel/Coolify.

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
