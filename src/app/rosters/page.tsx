"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Download } from "lucide-react";
import { getRosterMembers } from "@/lib/roster-utils";
import { DownloadRosterDialog } from "@/components/download-roster-dialog";
import * as RosterPDF from "@/lib/pdf-utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import type { Member } from "@/types/member";
import type { Database } from "@/types/databasetypes";

type Division = Database["public"]["Enums"]["division"];
const DIVISIONS: Division[] = ["163", "173", "174", "175", "184", "185", "188", "209", "520"];

export default function RostersPage() {
  const [selectedRoster, setSelectedRoster] = useState<Database["public"]["Enums"]["sys_seniority_type"]>("WC");
  const [showInactive, setShowInactive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<Division | "all">("all");
  const supabase = createClient();

  const {
    data: members,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members", showInactive, selectedDivision, selectedRoster],
    queryFn: async () => {
      console.log("Fetching members with division:", selectedDivision);
      let query = supabase.from("members").select("*");

      if (!showInactive) {
        query = query.not("status", "eq", "IN-ACTIVE");
      }

      // Add filter for division
      if (selectedDivision !== "all") {
        query = query.eq("division", selectedDivision);
      }

      const { data, error } = await query.order("prior_vac_sys", { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return data as Member[];
    },
  });

  const sortedMembers = members ? getRosterMembers(members, selectedRoster) : [];

  // Construct the full roster title
  const getRosterTitle = () => {
    console.log("Building title with selectedRoster:", selectedRoster, "and selectedDivision:", selectedDivision);
    const baseTitle = `${selectedRoster} Roster`;
    const fullTitle = selectedDivision !== "all" ? `${baseTitle} - Division ${selectedDivision}` : baseTitle;
    console.log("Constructed full title:", fullTitle);
    return fullTitle;
  };

  // Log state changes
  useEffect(() => {
    console.log("State changed - selectedRoster:", selectedRoster, "selectedDivision:", selectedDivision);
  }, [selectedRoster, selectedDivision]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAdmin(!!session?.user);
    };
    checkAuth();
  }, [supabase.auth]);

  const handleDownload = (fields: string[]) => {
    const currentTitle = getRosterTitle();
    console.log("Handling download with title:", currentTitle);
    setSelectedFields(fields);
  };

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-red-500">Error loading members: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container max-w-[calc(100vw-2rem)] mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Seniority Rosters</h1>
          <p className="text-sm text-muted-foreground">View and download seniority rosters by division</p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Switch checked={showInactive} onCheckedChange={setShowInactive} id="show-inactive" />
              <label htmlFor="show-inactive" className="text-sm whitespace-nowrap">
                Show Inactive Members
              </label>
            </div>
          )}
          <div className="relative">
            <Select
              value={selectedRoster}
              onValueChange={(value) => {
                console.log("Roster selection changed to:", value);
                setSelectedRoster(value as Database["public"]["Enums"]["sys_seniority_type"]);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Roster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WC">WC</SelectItem>
                <SelectItem value="DMIR">DMIR</SelectItem>
                <SelectItem value="DWP">DWP</SelectItem>
                <SelectItem value="EJ&E">EJ&E</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Select
              value={selectedDivision}
              onValueChange={(value) => {
                console.log("Division selection changed to:", value);
                setSelectedDivision(value as Division | "all");
                console.log("Current roster title would be:", getRosterTitle());
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {DIVISIONS.map((div) => (
                  <SelectItem key={div} value={div}>
                    Division {div}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const title = getRosterTitle();
              console.log("Opening download dialog with title:", title);
              console.log("Current state - selectedRoster:", selectedRoster, "selectedDivision:", selectedDivision);
              setShowDownloadDialog(true);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-12rem)] border rounded-lg">
        <div className="flex-1 overflow-auto relative">
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium">Rank</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">PIN</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Prior Rights</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Engineer Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Zone</th>
                {isAdmin && <th className="h-12 px-4 text-left align-middle font-medium">Prior Rights Rank</th>}
                <th className="h-12 px-4 text-left align-middle font-medium">Division</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="h-12 px-4 align-middle text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                sortedMembers.map((member: Member, index: number) => (
                  <tr key={member.id || index} className="border-b">
                    <td className="h-12 px-4 align-middle">{index + 1}</td>
                    <td className="h-12 px-4 align-middle">{`${member.first_name || ""} ${member.last_name || ""}`}</td>
                    <td className="h-12 px-4 align-middle">{member.pin_number}</td>
                    <td className="h-12 px-4 align-middle">{member.system_sen_type}</td>
                    <td className="h-12 px-4 align-middle">
                      {member.engineer_date ? new Date(member.engineer_date + "T00:00:00").toLocaleDateString() : "-"}
                    </td>
                    <td className="h-12 px-4 align-middle">{member.zone || "-"}</td>
                    {isAdmin && <td className="h-12 px-4 align-middle">{member.prior_vac_sys || "-"}</td>}
                    <td className="h-12 px-4 align-middle">{member.division || member.misc_notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DownloadRosterDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        members={sortedMembers}
        selectedRoster={getRosterTitle()}
        onDownload={handleDownload}
      />
    </div>
  );
}
