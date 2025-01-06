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

export default function RostersPage() {
  const [selectedRoster, setSelectedRoster] = useState<Database["public"]["Enums"]["sys_seniority_type"]>("WC");
  const [showInactive, setShowInactive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const supabase = createClient();

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

  const {
    data: members,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members", showInactive],
    queryFn: async () => {
      const query = supabase.from("members").select("*");

      if (!showInactive) {
        query.not("status", "eq", "IN-ACTIVE");
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

  const handleDownload = (fields: string[]) => {
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
              onValueChange={(value) => setSelectedRoster(value as Database["public"]["Enums"]["sys_seniority_type"])}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Roster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WC">WC Roster</SelectItem>
                <SelectItem value="DMIR">DMIR Roster</SelectItem>
                <SelectItem value="DWP">DWP Roster</SelectItem>
                <SelectItem value="EJ&E">EJ&E Roster</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowDownloadDialog(true)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>PIN</TableHead>
              <TableHead>Prior Rights</TableHead>
              <TableHead>Engineer Date</TableHead>
              <TableHead>Zone</TableHead>
              {isAdmin && <TableHead>Prior Rights Rank</TableHead>}
              <TableHead>Division</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              sortedMembers.map((member: Member, index: number) => (
                <TableRow key={member.id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{`${member.first_name || ""} ${member.last_name || ""}`}</TableCell>
                  <TableCell>{member.pin_number}</TableCell>
                  <TableCell>{member.system_sen_type}</TableCell>
                  <TableCell>
                    {member.engineer_date ? new Date(member.engineer_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{member.zone || "-"}</TableCell>
                  {isAdmin && <TableCell>{member.prior_vac_sys || "-"}</TableCell>}
                  <TableCell>{member.division || member.misc_notes || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DownloadRosterDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        members={sortedMembers}
        selectedRoster={selectedRoster}
        onDownload={handleDownload}
      />
    </div>
  );
}
