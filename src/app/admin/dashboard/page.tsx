"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus, ArrowUpDown, ArrowUp, ArrowDown, Search, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Member } from "@/types/member";
import type { Database } from "@/types/databasetypes";
import { EditMemberDialog } from "@/components/edit-member-dialog";
import { Input } from "@/components/ui/input";
import { getRosterMembers } from "@/lib/roster-utils";
import { AddMemberDialog } from "@/components/add-member-dialog";
import { DownloadRosterDialog } from "@/components/download-roster-dialog";

type SortConfig = {
  key: keyof Member | null;
  direction: "asc" | "desc";
};

type Division = Database["public"]["Enums"]["division"];
type Zone = Database["public"]["Enums"]["zone"];
type ActiveFilter = "none" | "zone" | "division";
type RosterOrder = "default" | "wc" | "dmir" | "dwp" | "eje" | "osl-wc" | "osl-dmir" | "osl-dwp" | "osl-eje";

const DIVISIONS: Division[] = ["163", "173", "174", "175", "184", "185", "188", "209", "520"];
const ZONES: Zone[] = [
  "zone 1",
  "zone 2",
  "zone 3",
  "zone 4",
  "zone 5",
  "zone 6",
  "zone 7",
  "zone 8",
  "zone 9",
  "zone 10",
  "zone 11",
  "zone 12",
  "zone 13",
];

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [showInactive, setShowInactive] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | "all">("all");
  const [selectedZone, setSelectedZone] = useState<Zone | "all">("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "last_name", direction: "asc" });
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("none");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rosterOrder, setRosterOrder] = useState<RosterOrder>("default");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

  const {
    data: members,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-members", showInactive, sortConfig, selectedDivision, selectedZone, searchQuery, rosterOrder],
    queryFn: async () => {
      let query = supabase.from("members").select("*");

      // Add filter for inactive members
      if (!showInactive) {
        query = query.not("status", "eq", "IN-ACTIVE");
      }

      // Add filter for division
      if (selectedDivision !== "all") {
        query = query.eq("division", selectedDivision);
      }

      // Add filter for zone
      if (selectedZone !== "all") {
        query = query.eq("zone", selectedZone);
      }

      // Add search filter
      if (searchQuery) {
        query = query.or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,pin_number.eq.${
            !isNaN(Number(searchQuery)) ? searchQuery : 0
          }`
        );
      }

      // For default order, use the existing sort
      if (rosterOrder === "default") {
        if (sortConfig.key) {
          query = query.order(sortConfig.key, { ascending: sortConfig.direction === "asc" });
        }
        if (sortConfig.key !== "last_name") {
          query = query.order("last_name", { ascending: true });
        }
      } else {
        // For roster orders, we'll sort after fetching
        query = query.order("prior_vac_sys", { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply roster-specific sorting if needed
      if (rosterOrder !== "default" && data) {
        const rosterTypeForCalculation = rosterOrder.startsWith("osl-")
          ? rosterOrder.toLowerCase() === "osl-eje"
            ? "OSL-EJ&E"
            : rosterOrder.toUpperCase()
          : rosterOrder === "eje"
          ? "EJ&E"
          : rosterOrder.toUpperCase();

        return getRosterMembers(data as Member[], rosterTypeForCalculation);
      }

      return (data || []) as Member[];
    },
  });

  const handleSort = (key: keyof Member) => {
    // Only allow sorting in default roster order
    if (rosterOrder === "default") {
      setSortConfig((current) => ({
        key,
        direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
      }));
    }
  };

  const SortableHeader = ({ column, label }: { column: keyof Member; label: string }) => {
    const isActive = sortConfig.key === column;
    return (
      <TableHead>
        <Button
          variant="ghost"
          onClick={() => handleSort(column)}
          className="h-8 flex items-center gap-1 hover:bg-transparent"
        >
          {label}
          {isActive ? (
            sortConfig.direction === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
        </Button>
      </TableHead>
    );
  };

  const FilterHeader = ({
    type,
    label,
    value,
    onChange,
    options,
    formatOption,
  }: {
    type: ActiveFilter;
    label: string;
    value: string;
    onChange: (value: any) => void;
    options: string[];
    formatOption?: (opt: string) => string;
  }) => {
    const handleChange = (newValue: string) => {
      // Reset the other filter when making a selection
      if (type === "zone") {
        setSelectedDivision("all");
      } else if (type === "division") {
        setSelectedZone("all");
      }
      onChange(newValue);
      setActiveFilter("none");
    };

    return (
      <TableHead>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setActiveFilter(activeFilter === type ? "none" : type)}
            className="h-8 flex items-center gap-1 hover:bg-transparent"
          >
            {value === "all" ? (
              label
            ) : (
              <span className="font-medium">{formatOption ? formatOption(value) : value}</span>
            )}
            {activeFilter === type ? <ArrowUp className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 opacity-50" />}
          </Button>
          {activeFilter === type && (
            <Select value={value} onValueChange={handleChange}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder={`All ${label}s`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{`All ${label}s`}</SelectItem>
                {options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {formatOption ? formatOption(opt) : opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </TableHead>
    );
  };

  const DivisionHeader = () => (
    <FilterHeader
      type="division"
      label="Division"
      value={selectedDivision}
      onChange={(value) => setSelectedDivision(value as Division | "all")}
      options={DIVISIONS}
      formatOption={(div) => `Division ${div}`}
    />
  );

  const ZoneHeader = () => (
    <FilterHeader
      type="zone"
      label="Zone"
      value={selectedZone}
      onChange={(value) => setSelectedZone(value as Zone | "all")}
      options={ZONES}
      formatOption={(zone) => zone.charAt(0).toUpperCase() + zone.slice(1)}
    />
  );

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-red-500">Error loading members: {(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Member Management</h1>
          <p className="text-sm text-muted-foreground">Manage all union members</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} id="show-inactive" />
            <label htmlFor="show-inactive" className="text-sm">
              Show Inactive Members
            </label>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowDownloadDialog(true)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-[350px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or PIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          {searchQuery && (
            <Button variant="ghost" onClick={() => setSearchQuery("")} className="h-8 px-2 text-muted-foreground">
              Clear
            </Button>
          )}
          <p>
            Table headers can be used to sort members, but only in Default (Name Order) view as the Roster have their
            own sorting logic. However, You *can* filter rosters by Zone or Division.
          </p>
        </div>

        <Select value={rosterOrder} onValueChange={(value) => setRosterOrder(value as RosterOrder)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Roster Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default (Name Order)</SelectItem>
            <SelectItem value="wc">WC Roster</SelectItem>
            <SelectItem value="dmir">DMIR Roster</SelectItem>
            <SelectItem value="dwp">DWP Roster</SelectItem>
            <SelectItem value="eje">EJ&E Roster</SelectItem>
            <SelectItem value="osl-wc">WC Order Selection List</SelectItem>
            <SelectItem value="osl-dmir">DMIR Order Selection List</SelectItem>
            <SelectItem value="osl-dwp">DWP Order Selection List</SelectItem>
            <SelectItem value="osl-eje">EJ&E Order Selection List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col h-[calc(100vh-16rem)] border rounded-lg">
        <div className="flex-1 overflow-auto relative">
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <SortableHeader column="last_name" label="Name" />
                <SortableHeader column="pin_number" label="PIN" />
                <SortableHeader column="system_sen_type" label="Prior Rights" />
                <SortableHeader column="engineer_date" label="Engineer Date" />
                <ZoneHeader />
                <SortableHeader column="home_zone" label="Home Zone" />
                <DivisionHeader />
                <SortableHeader column="status" label="Status" />
                <TableHead className="h-12 px-4 text-right align-middle font-medium">Actions</TableHead>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="h-12 px-4 align-middle text-center">
                    Loading...
                  </td>
                </tr>
              ) : members && members.length > 0 ? (
                members.map((member, index) => (
                  <tr key={`${member.id || member.pin_number || index}`} className="border-b">
                    <td className="h-12 px-4 align-middle">{`${member.first_name || ""} ${member.last_name || ""}`}</td>
                    <td className="h-12 px-4 align-middle">{member.pin_number}</td>
                    <td className="h-12 px-4 align-middle">{member.system_sen_type || "-"}</td>
                    <td className="h-12 px-4 align-middle">
                      {member.engineer_date ? new Date(member.engineer_date + "T00:00:00").toLocaleDateString() : "-"}
                    </td>
                    <td className="h-12 px-4 align-middle">{member.zone || "-"}</td>
                    <td className="h-12 px-4 align-middle">{member.home_zone || "-"}</td>
                    <td className="h-12 px-4 align-middle">{member.division || "-"}</td>
                    <td className="h-12 px-4 align-middle">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          member.status === "IN-ACTIVE" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {member.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="h-12 px-4 align-middle text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedMember(member);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="h-12 px-4 align-middle text-center">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMember && (
        <EditMemberDialog member={selectedMember} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      )}
      <AddMemberDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <DownloadRosterDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        members={members || []}
        selectedRoster={
          rosterOrder === "default"
            ? "Admin"
            : rosterOrder.startsWith("osl-")
            ? `${rosterOrder.replace(/^osl-/i, "").toUpperCase()} Order Selection List`
            : `${rosterOrder.toUpperCase()} Roster`
        }
        onDownload={setSelectedFields}
      />
    </div>
  );
}
