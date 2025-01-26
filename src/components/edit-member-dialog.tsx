import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Member } from "@/types/member";
import type { Database } from "@/types/databasetypes";

type Division = Database["public"]["Enums"]["division"];
type Zone = Database["public"]["Enums"]["zone"];
type SeniorityType = Database["public"]["Enums"]["sys_seniority_type"];

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
const SENIORITY_TYPES: SeniorityType[] = ["WC", "DMIR", "DWP", "SYS1", "EJ&E", "SYS2"];

interface EditMemberDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: member.first_name || "",
    last_name: member.last_name || "",
    pin_number: member.pin_number || "",
    system_sen_type: member.system_sen_type || "SYS2",
    engineer_date: member.engineer_date ? new Date(member.engineer_date).toISOString().split("T")[0] : "",
    zone: member.zone || "",
    home_zone: member.home_zone || "",
    prior_vac_sys: member.prior_vac_sys || "",
    division: member.division || "",
    status: member.status || "ACTIVE",
    company_hire_date: member.company_hire_date ? new Date(member.company_hire_date).toISOString().split("T")[0] : "",
    date_of_birth: member.date_of_birth ? new Date(member.date_of_birth).toISOString().split("T")[0] : "",
    misc_notes: member.misc_notes || "",
  });

  // Reset form data when member changes
  useEffect(() => {
    setFormData({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      pin_number: member.pin_number || "",
      system_sen_type: member.system_sen_type || "SYS2",
      engineer_date: member.engineer_date ? new Date(member.engineer_date).toISOString().split("T")[0] : "",
      zone: member.zone || "",
      home_zone: member.home_zone || "",
      prior_vac_sys: member.prior_vac_sys || "",
      division: member.division || "",
      status: member.status || "ACTIVE",
      company_hire_date: member.company_hire_date ? new Date(member.company_hire_date).toISOString().split("T")[0] : "",
      date_of_birth: member.date_of_birth ? new Date(member.date_of_birth).toISOString().split("T")[0] : "",
      misc_notes: member.misc_notes || "",
    });
  }, [member]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Prepare update data with proper null handling
      const updateData = {
        ...formData,
        // Convert numeric fields
        pin_number: Number(formData.pin_number),
        prior_vac_sys: formData.prior_vac_sys ? Number(formData.prior_vac_sys) : null,

        // Handle enum fields - convert empty strings to null
        zone: formData.zone || null,
        home_zone: formData.home_zone || null,
        division: formData.division || null,
        system_sen_type: formData.system_sen_type || null,

        // Handle date fields - convert empty strings to null
        engineer_date: formData.engineer_date || null,
        company_hire_date: formData.company_hire_date || null,
        date_of_birth: formData.date_of_birth || null,

        // Handle optional text fields
        misc_notes: formData.misc_notes || null,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
      };

      console.log("Updating member with data:", updateData);

      const { data, error } = await supabase
        .from("members")
        .update(updateData)
        .eq("pin_number", member.pin_number)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        alert(`Error updating member: ${error.message}`);
        return;
      }

      console.log("Update successful:", data);

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["all-members"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating member:", error);
      alert("Error updating member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[calc(100vh-2rem)] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Edit Member Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin_number">PIN</Label>
            <Input
              id="pin_number"
              value={formData.pin_number}
              onChange={(e) => handleChange("pin_number", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="system_sen_type">Prior Rights</Label>
            <Select value={formData.system_sen_type} onValueChange={(value) => handleChange("system_sen_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Prior Rights" />
              </SelectTrigger>
              <SelectContent>
                {SENIORITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="engineer_date">Engineer Date</Label>
            <Input
              id="engineer_date"
              type="date"
              value={formData.engineer_date}
              onChange={(e) => handleChange("engineer_date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zone">Zone</Label>
            <Select
              value={formData.zone}
              onValueChange={(value) => handleChange("zone", value === "null" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Zone" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="null">Remove zone</SelectItem>
                {ZONES.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone.charAt(0).toUpperCase() + zone.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="home_zone">Home Zone</Label>
            <Select
              value={formData.home_zone}
              onValueChange={(value) => handleChange("home_zone", value === "null" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Home Zone" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="null">Remove zone</SelectItem>
                {ZONES.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone.charAt(0).toUpperCase() + zone.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prior_vac_sys">Prior Vac Sys</Label>
            <Input
              id="prior_vac_sys"
              type="number"
              value={formData.prior_vac_sys}
              onChange={(e) => handleChange("prior_vac_sys", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Select value={formData.division} onValueChange={(value) => handleChange("division", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {DIVISIONS.map((div) => (
                  <SelectItem key={div} value={div}>
                    Division {div}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="IN-ACTIVE">IN-ACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_hire_date">Company Hire Date</Label>
            <Input
              id="company_hire_date"
              type="date"
              value={formData.company_hire_date}
              onChange={(e) => handleChange("company_hire_date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="misc_notes">Notes</Label>
            <Input
              id="misc_notes"
              value={formData.misc_notes}
              onChange={(e) => handleChange("misc_notes", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
