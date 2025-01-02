"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus } from "lucide-react";
import type { Member } from "@/types/member";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [showInactive, setShowInactive] = useState(false);

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
    queryKey: ["all-members", showInactive],
    queryFn: async () => {
      let query = supabase.from("members").select("*");

      // Add filter for inactive members
      if (!showInactive) {
        query = query.not("status", "eq", "IN-ACTIVE");
      }

      // Add ordering last
      query = query.order("last_name", { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      console.log("Query result:", { showInactive, count: data?.length, data });
      return (data || []) as Member[];
    },
  });

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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>PIN</TableHead>
              <TableHead>Prior Rights</TableHead>
              <TableHead>Engineer Date</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Prior Vac Sys</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Status</TableHead>
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
                      onClick={() => member.id && router.push(`/admin/members/${member.id}`)}
                      disabled={!member.id}
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
    </div>
  );
}
