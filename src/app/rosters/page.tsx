"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getRosterMembers } from "@/lib/roster-utils";
import type { Member } from "@/types/member";
import type { Database } from "@/types/databasetypes";

export default function RostersPage() {
  const [selectedRoster, setSelectedRoster] = useState<Database["public"]["Enums"]["sys_seniority_type"]>("WC");
  const supabase = createClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("members").select("*").order("prior_vac_sys", { ascending: true });

      if (error) throw error;

      // Transform the data to match our Member type
      return data.map(
        (member): Member => ({
          id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          pin_number: member.pin_number,
          system_sen_type: member.system_sen_type,
          engineer_date: member.engineer_date,
          date_of_birth: member.date_of_birth,
          zone: member.zone,
          prior_vac_sys: member.prior_vac_sys,
          status: member.status,
        })
      );
    },
  });

  const sortedMembers = members ? getRosterMembers(members, selectedRoster) : [];

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Seniority Rosters</h1>
          <p className="text-sm text-muted-foreground">View and download seniority rosters by division</p>
        </div>
        <div className="flex items-center gap-4">
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
          <Button variant="outline" size="icon">
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
              <TableHead>Prior Vac Sys</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
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
                  <TableCell>{member.prior_vac_sys || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
