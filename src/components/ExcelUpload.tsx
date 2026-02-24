import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import type { SponsorshipRequest } from "@/data/sponsorshipRequests";

interface ExcelUploadProps {
  onImport: (requests: Omit<SponsorshipRequest, "id">[]) => void;
}

const COLUMN_MAP: Record<string, keyof Omit<SponsorshipRequest, "id">> = {
  "Nº PV": "numero_pv",
  "nº pv": "numero_pv",
  "Solicitante": "solicitante",
  "Objeto": "objeto",
  "Data Recebimento": "data_recebimento",
  "Cidade": "cidade",
  "Data da Ação": "data_acao",
  "Mês da Ação": "mes_acao",
  "Valor Solicitado": "valor_solicitado",
  "Histórico do Pedido": "historico_pedido",
  "Histórico 2025": "historico_2025",
  "Contrapartidas": "contrapartidas",
  "Parecer STI": "parecer_sti",
  "Parecer Educação Profissional": "parecer_educacao",
  "Parecer Final SENAI": "parecer_final_senai",
  "Parecer SESI": "parecer_sesi",
  "Parecer FIEP": "parecer_fiep",
  "Parecer IEL": "parecer_iel",
  "Parecer UNISENAI": "parecer_unisenai",
};

const ExcelUpload = ({ onImport }: ExcelUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

        if (jsonData.length === 0) {
          toast({ title: "Planilha vazia", variant: "destructive" });
          return;
        }

        const requests: Omit<SponsorshipRequest, "id">[] = jsonData.map((row) => {
          const mapped: Record<string, string | null> = {
            numero_pv: null,
            solicitante: "",
            objeto: "",
            data_recebimento: null,
            cidade: null,
            data_acao: null,
            mes_acao: null,
            valor_solicitado: null,
            historico_pedido: null,
            historico_2025: null,
            contrapartidas: null,
            parecer_sti: null,
            parecer_educacao: null,
            parecer_final_senai: null,
            parecer_sesi: null,
            parecer_fiep: null,
            parecer_iel: null,
            parecer_unisenai: null,
            parecer_label: "",
            valor_oferecido: "",
          };

          for (const [excelCol, value] of Object.entries(row)) {
            const trimmed = excelCol.trim();
            const dbField = COLUMN_MAP[trimmed];
            if (dbField) {
              mapped[dbField] = String(value || "").trim();
            }
          }

          return mapped as unknown as Omit<SponsorshipRequest, "id">;
        });

        const valid = requests.filter((r) => r.solicitante && r.objeto);
        if (valid.length === 0) {
          toast({
            title: "Nenhum pedido válido encontrado",
            description: "Verifique se a planilha possui as colunas 'Solicitante' e 'Objeto'.",
            variant: "destructive",
          });
          return;
        }

        onImport(valid);
      } catch {
        toast({ title: "Erro ao ler a planilha", variant: "destructive" });
      }
    };
    reader.readAsBinaryString(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4" />
        Importar Planilha
      </Button>
    </>
  );
};

export default ExcelUpload;
