import { CalendarDays, MapPin, Clock, DollarSign, History, Handshake } from "lucide-react";
import type { SponsorshipRequest } from "@/data/sponsorshipRequests";
import ParecerCard from "./ParecerCard";
import FileUploadSection from "./FileUploadSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

interface SponsorshipDetailProps {
  request: SponsorshipRequest;
  onFieldChange: (field: string, value: string) => void;
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-2.5 py-2">
    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
    <div>
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <p className="text-sm text-card-foreground mt-0.5">{value}</p>
    </div>
  </div>
);

const parseParecerLabel = (value: string | null) => {
  if (!value || value === "NA" || value === "Aguardando") {
    return { type: "simple" as const, text: value || "NA" };
  }
  // Check if starts with FAVORÁVEL or NÃO FAVORÁVEL
  const upper = value.toUpperCase().trim();
  if (upper.startsWith("NÃO FAVORÁVEL") || upper.startsWith("NAO FAVORAVEL")) {
    const rest = value.replace(/^(NÃO FAVORÁVEL|NAO FAVORAVEL)\s*[-–—]?\s*/i, "").trim();
    return { type: "nao_favoravel" as const, label: "NÃO FAVORÁVEL", tooltip: rest };
  }
  if (upper.startsWith("FAVORÁVEL") || upper.startsWith("FAVORAVEL")) {
    const rest = value.replace(/^(FAVORÁVEL|FAVORAVEL)\s*[-–—]?\s*/i, "").trim();
    return { type: "favoravel" as const, label: "FAVORÁVEL", tooltip: rest };
  }
  return { type: "simple" as const, text: value };
};

const parecerLabelColor = (value: string | null) => {
  if (!value || value === "NA") return "bg-muted text-muted-foreground";
  if (value === "Aguardando") return "bg-warning/15 text-warning border border-warning/30";
  return "bg-secondary text-secondary-foreground";
};

const formatDateDisplay = (value: string | null) => {
  if (!value || value === "-") return "-";
  // Try parsing Excel serial number
  const num = Number(value);
  if (!isNaN(num) && num > 30000 && num < 60000) {
    const date = new Date((num - 25569) * 86400000);
    return date.toLocaleDateString("pt-BR");
  }
  // Try ISO / standard date
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
  return value;
};

const formatCurrencyDisplay = (value: string | null) => {
  if (!value || value === "-") return "-";
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const SponsorshipDetail = ({ request, onFieldChange }: SponsorshipDetailProps) => {
  const [openParecer, setOpenParecer] = useState<{ label: string; text: string } | null>(null);
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    onFieldChange("valor_oferecido", raw);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Title + Event Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded border border-border shadow-sm p-5">
          <h2 className="text-xl font-bold text-card-foreground">{request.solicitante}</h2>
          {request.numero_pv && (
            <span className="text-[10px] text-muted-foreground font-mono">{request.numero_pv}</span>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">{request.objeto}</p>
        </div>
        <div className="lg:col-span-2 bg-card rounded border border-border shadow-sm p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Descrição do Evento</label>
          <Textarea
            placeholder="Descreva o evento aqui..."
            value={request.descricao_evento || ""}
            onChange={(e) => onFieldChange("descricao_evento", e.target.value)}
            className="text-sm min-h-[80px] resize-y w-full"
          />
        </div>
      </div>

      {/* Info grid + small pareceres */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 bg-card rounded border border-border shadow-sm p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Dados da Solicitação</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <InfoItem icon={CalendarDays} label="Data Recebimento" value={formatDateDisplay(request.data_recebimento)} />
            <InfoItem icon={MapPin} label="Cidade" value={request.cidade || "-"} />
            <InfoItem icon={Clock} label="Data da Ação" value={request.data_acao || "-"} />
            <InfoItem icon={CalendarDays} label="Mês da Ação" value={request.mes_acao || "-"} />
            <InfoItem icon={DollarSign} label="Valor Solicitado" value={request.valor_solicitado || "-"} />
          </div>
        </div>

        {/* Institutional pareceres with hover */}
        <div className="bg-card rounded border border-border shadow-sm p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Pareceres Institucionais</h3>
          <div className="space-y-2">
            {[
              { label: "SESI", value: request.parecer_sesi },
              { label: "FIEP", value: request.parecer_fiep },
              { label: "IEL", value: request.parecer_iel },
              { label: "UNISENAI", value: request.parecer_unisenai },
            ].map(({ label, value }) => {
              const parsed = parseParecerLabel(value);
              return (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  {parsed.type === "simple" ? (
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold ${parecerLabelColor(parsed.text)}`}>
                      {parsed.text}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 font-semibold cursor-pointer ${
                        parsed.type === "favoravel"
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-destructive/15 text-destructive border border-destructive/30"
                      }`}
                      onClick={() => setOpenParecer({ label: `Parecer ${label}`, text: parsed.tooltip || value || "-" })}
                    >
                      {parsed.label}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Valor oferecido */}
        <div className="bg-card rounded border border-border shadow-sm p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Valor de Apoio Proposto</h3>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
            <Input
              type="text"
              placeholder="0,00"
              value={request.valor_oferecido ? formatCurrency(request.valor_oferecido) : ""}
              onChange={handleCurrencyInput}
              className="pl-10 text-right font-semibold text-lg"
            />
          </div>
        </div>
      </div>

      {/* Historico + Contrapartidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded border border-border shadow-sm p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Histórico do Pedido
          </h3>
          <p className="text-sm text-card-foreground leading-relaxed">{request.historico_pedido || "-"}</p>
          {request.historico_2025 && (
            <>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-3 mb-1">Histórico 2025</h4>
              <p className="text-sm text-card-foreground leading-relaxed">{request.historico_2025}</p>
            </>
          )}
        </div>
        <div className="bg-card rounded border border-border shadow-sm p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Handshake className="w-3.5 h-3.5" /> Contrapartidas Oferecidas
          </h3>
          <p className="text-sm text-card-foreground leading-relaxed">{request.contrapartidas || "-"}</p>
        </div>
      </div>

      {/* File attachments */}
      <FileUploadSection requestId={request.id} />

      {/* Main pareceres */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ParecerCard title="Parecer STI" content={request.parecer_sti || ""} variant="sti" />
        <ParecerCard title="Parecer Educação Profissional" content={request.parecer_educacao || ""} variant="educacao" />
        <ParecerCard
          title="Parecer Final SENAI"
          content={request.parecer_final_senai || ""}
          variant="final"
          editable
          onSave={(v) => onFieldChange("parecer_final_senai", v)}
          label={request.parecer_label || ""}
          onLabelChange={(v) => onFieldChange("parecer_label", v)}
        />
      </div>

      <Dialog open={!!openParecer} onOpenChange={(open) => !open && setOpenParecer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{openParecer?.label}</DialogTitle>
            <DialogDescription className="sr-only">Texto completo do parecer</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-line">{openParecer?.text}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorshipDetail;
