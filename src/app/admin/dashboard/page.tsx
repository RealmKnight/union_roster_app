"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Member } from "@/types/member";
import type { Database } from "@/types/databasetypes";
import { EditMemberDialog } from "@/components/edit-member-dialog";
import { Input } from "@/components/ui/input";
import { getRosterMembers } from "@/lib/roster-utils";

type SortConfig = {
  key: keyof Member | null;
  direction: "asc" | "desc";
};

type Division = Database["public"]["Enums"]["division"];
type Zone = Database["public"]["Enums"]["zone"];
type ActiveFilter = "none" | "zone" | "division";
type RosterOrder = "default" | "wc" | "dmir" | "dwp" | "eje";

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
        return getRosterMembers(
          data as Member[],
          rosterOrder.toUpperCase() as Database["public"]["Enums"]["sys_seniority_type"]
        );
      }

      return (data || []) as Member[];
    },
  });

  const handleSort = (key: keyof Member) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
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
        </div>

        <Select value={rosterOrder} onValueChange={(value) => setRosterOrder(value as RosterOrder)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Roster Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default (Name Order)</SelectItem>
            <SelectItem value="wc">WC Roster Order</SelectItem>
            <SelectItem value="dmir">DMIR Roster Order</SelectItem>
            <SelectItem value="dwp">DWP Roster Order</SelectItem>
            <SelectItem value="eje">EJ&E Roster Order</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="last_name" label="Name" />
              <SortableHeader column="pin_number" label="PIN" />
              <SortableHeader column="system_sen_type" label="Prior Rights" />
              <SortableHeader column="engineer_date" label="Engineer Date" />
              <ZoneHeader />
              <SortableHeader column="prior_vac_sys" label="Prior Vac Sys" />
              <DivisionHeader />
              <SortableHeader column="status" label="Status" />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : members && members.length > 0 ? (
              members.map((member, index) => (
                <TableRow key={`${member.id || member.pin_number || index}`}>
                  <TableCell>{`${member.first_name || ""} ${member.last_name || ""}`}</TableCell>
                  <TableCell>{member.pin_number}</TableCell>
                  <TableCell>{member.system_sen_type || "-"}</TableCell>
                  <TableCell>
                    {member.engineer_date ? new Date(member.engineer_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{member.zone || "-"}</TableCell>
                  <TableCell>{member.prior_vac_sys || "-"}</TableCell>
                  <TableCell>{member.division || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        member.status === "IN-ACTIVE" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {member.status || "ACTIVE"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedMember && (
        <EditMemberDialog member={selectedMember} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      )}
    </div>
  );
}
