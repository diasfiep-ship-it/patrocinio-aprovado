import { FileText } from "lucide-react";
import ExcelUpload from "./ExcelUpload";
import type { SponsorshipRequest } from "@/data/sponsorshipRequests";

interface SponsorshipHeaderProps {
  onImport: (requests: Omit<SponsorshipRequest, "id">[]) => void;
}

const SponsorshipHeader = ({ onImport }: SponsorshipHeaderProps) => {
  return (
    <header className="bg-header text-header-foreground px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6" />
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Pareceres de Patrocínio</h1>
          <p className="text-xs opacity-80">SENAI Paraná — Comitê de Aprovação</p>
        </div>
      </div>
      <ExcelUpload onImport={onImport} />
    </header>
  );
};

export default SponsorshipHeader;
