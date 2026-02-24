import { useRef, useState, useEffect } from "react";
import { Upload, FileText, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  created_at: string;
}

interface FileUploadSectionProps {
  requestId: string;
}

const FileUploadSection = ({ requestId }: FileUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = async () => {
    const { data, error } = await supabase
      .from("request_attachments")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });

    if (!error && data) setAttachments(data);
  };

  useEffect(() => {
    fetchAttachments();
  }, [requestId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowed.includes(file.type)) {
      toast({ title: "Formato não suportado", description: "Envie arquivos Excel ou PDF.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${requestId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("request-files")
      .upload(path, file);

    if (uploadError) {
      toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from("request_attachments").insert({
      request_id: requestId,
      file_name: file.name,
      file_path: path,
      file_type: file.type,
    });

    if (dbError) {
      toast({ title: "Erro ao salvar registro", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Arquivo enviado com sucesso" });
      fetchAttachments();
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (att: Attachment) => {
    await supabase.storage.from("request-files").remove([att.file_path]);
    await supabase.from("request_attachments").delete().eq("id", att.id);
    setAttachments((prev) => prev.filter((a) => a.id !== att.id));
    toast({ title: "Arquivo removido" });
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("request-files").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="bg-card rounded border border-border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Arquivos Anexados
        </h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.pdf"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Enviando..." : "Anexar Arquivo"}
          </Button>
        </div>
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum arquivo anexado.</p>
      ) : (
        <ul className="space-y-1.5">
          {attachments.map((att) => (
            <li key={att.id} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2">
              <span className="text-sm text-card-foreground truncate max-w-[70%]">{att.file_name}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={getPublicUrl(att.file_path)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(att)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUploadSection;
