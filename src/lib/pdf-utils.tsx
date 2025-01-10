import type { Member } from "@/types/member";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

async function loadPdfMake() {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeModule.default;

  // Initialize fonts
  if (typeof window !== "undefined") {
    // Try different possible paths to get the VFS
    const vfs =
      (pdfFontsModule as any).pdfMake?.vfs || (pdfFontsModule as any).default?.pdfMake?.vfs || pdfFontsModule.default;

    if (vfs) {
      pdfMake.vfs = vfs;
    } else {
      throw new Error("Could not load PDF fonts");
    }
  }

  return pdfMake;
}

export async function generatePDF({
  members,
  selectedFields,
  rosterType,
}: {
  members: Member[];
  selectedFields: string[];
  rosterType: string;
}) {
  if (typeof window === "undefined") {
    throw new Error("PDF generation can only be done in the browser");
  }

  // Load pdfMake with proper error handling
  let pdfMake;
  try {
    pdfMake = await loadPdfMake();
  } catch (error) {
    console.error("Error loading pdfMake:", error);
    throw new Error("Failed to load PDF generator");
  }

  // Define columns based on selected fields
  const columns = [
    { header: "Rank", key: "rank" },
    { header: "Name", key: "name" },
    { header: "PIN", key: "pin_number" },
    ...(selectedFields.includes("engineer_date") ? [{ header: "Engineer Date", key: "engineer_date" }] : []),
    ...(selectedFields.includes("date_of_birth") ? [{ header: "Date of Birth", key: "date_of_birth" }] : []),
    ...(selectedFields.includes("zone") ? [{ header: "Zone", key: "zone" }] : []),
    ...(selectedFields.includes("home_zone") ? [{ header: "Home Zone", key: "home_zone" }] : []),
    ...(selectedFields.includes("division") ? [{ header: "Division", key: "division" }] : []),
    ...(selectedFields.includes("prior_vac_sys") ? [{ header: "Prior Rights Rank", key: "prior_vac_sys" }] : []),
  ];

  // Create header row
  const headerRow = columns.map((col) => ({
    text: col.header,
    style: "tableHeader",
  }));

  // Create data rows
  const bodyRows = members.map((member, index) => {
    const row = [
      (index + 1).toString(),
      `${member.first_name || ""} ${member.last_name || ""}`.trim(),
      member.pin_number || "-",
    ];

    if (selectedFields.includes("engineer_date")) {
      row.push(member.engineer_date ? new Date(member.engineer_date + "T00:00:00").toLocaleDateString() : "-");
    }
    if (selectedFields.includes("date_of_birth")) {
      row.push(member.date_of_birth ? new Date(member.date_of_birth + "T00:00:00").toLocaleDateString() : "-");
    }
    if (selectedFields.includes("zone")) {
      row.push(member.zone || "-");
    }
    if (selectedFields.includes("home_zone")) {
      row.push(member.home_zone || "-");
    }
    if (selectedFields.includes("division")) {
      row.push(member.division || "-");
    }
    if (selectedFields.includes("prior_vac_sys")) {
      row.push(member.prior_vac_sys?.toString() || "-");
    }

    return row;
  });

  // Calculate column widths based on content
  const calculateColumnWidths = (columns: Array<{ header: string; key: string }>, bodyRows: any[][]) => {
    return columns.map((_, colIndex) => {
      // Get all values in this column including header
      const columnValues = [headerRow[colIndex].text, ...bodyRows.map((row) => row[colIndex]?.toString() || "")];

      // Find the maximum length in this column
      const maxLength = Math.max(...columnValues.map((val) => val.length));

      // Assign weights based on column type and content
      if (colIndex === 0) return "auto"; // Rank column (smallest)
      if (colIndex === 1) return "*"; // Name column (flexible)
      if (colIndex === 2) return "auto"; // PIN column (fixed width)

      // For date columns, use a fixed width
      if (["engineer_date", "date_of_birth"].includes(columns[colIndex]?.key)) {
        return "auto";
      }

      // For other columns, base it on content length
      return maxLength < 10 ? "auto" : "*";
    });
  };

  const docDefinition: TDocumentDefinitions = {
    content: [
      {
        columns: [
          {
            width: "*",
            text: "",
          },
          {
            width: "auto",
            text: rosterType,
            style: "header",
            alignment: "center",
            margin: [0, 0, 0, 5],
          },
          {
            width: "*",
            text: new Date().toLocaleDateString(),
            style: "headerDate",
            alignment: "right",
          },
        ],
        margin: [5, 5, 5, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: calculateColumnWidths(columns, bodyRows),
          body: [headerRow, ...bodyRows],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        alignment: "center" as const,
      },
      headerDate: {
        fontSize: 10,
        color: "#666666",
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        fillColor: "#424242",
        color: "#ffffff",
        alignment: "center" as const,
      },
    },
    defaultStyle: {
      fontSize: 9,
      alignment: "center" as const,
    },
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [30, 30, 30, 30],
  };

  return new Promise<Blob>((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(new Error("Failed to generate PDF"));
    }
  });
}
