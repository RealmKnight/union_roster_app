import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { generatePDF } from "@/lib/pdf-utils";
import type { Member } from "@/types/member";

interface DownloadButtonProps {
  members: Member[];
  selectedFields: string[];
  selectedRoster: string;
}

function DownloadButton({ members, selectedFields, selectedRoster }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const blob = await generatePDF({
        members,
        selectedFields,
        rosterType: selectedRoster,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedRoster.toLowerCase().replace(/ /g, "-")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button disabled={isGenerating} onClick={handleDownload}>
      {isGenerating ? "Generating PDF..." : "Download PDF"}
    </Button>
  );
}

interface DownloadRosterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  selectedRoster: string;
  onDownload: (selectedFields: string[]) => void;
}

const OPTIONAL_FIELDS = [
  { id: "engineer_date", label: "Engineer Date" },
  { id: "date_of_birth", label: "Date of Birth" },
  { id: "zone", label: "Zone" },
  { id: "home_zone", label: "Home Zone" },
  { id: "division", label: "Division" },
  { id: "prior_vac_sys", label: "Prior Rights Rank" },
];

export function DownloadRosterDialog({
  open,
  onOpenChange,
  members,
  selectedRoster,
  onDownload,
}: DownloadRosterDialogProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleFieldToggle = (field: string) => {
    setSelectedFields((current) =>
      current.includes(field) ? current.filter((f) => f !== field) : [...current, field]
    );
  };

  const allFields = ["rank", "name", "pin_number", ...selectedFields];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download {selectedRoster} Roster</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Required Fields</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <Checkbox checked disabled />
                <Label>Rank</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked disabled />
                <Label>Name</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked disabled />
                <Label>PIN</Label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Optional Fields</h4>
            <div className="grid grid-cols-1 gap-2">
              {OPTIONAL_FIELDS.map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                  />
                  <Label htmlFor={field.id}>{field.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <DownloadButton members={members} selectedFields={allFields} selectedRoster={selectedRoster} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
