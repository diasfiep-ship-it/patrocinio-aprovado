import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SponsorshipRequest } from "@/data/sponsorshipRequests";
import { toast } from "@/hooks/use-toast";

export function useSponsorshipRequests() {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from("sponsorship_requests")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar pedidos", description: error.message, variant: "destructive" });
      return;
    }

    setRequests(
      (data || []).map((r) => ({
        id: r.id,
        numero_pv: r.numero_pv,
        solicitante: r.solicitante,
        objeto: r.objeto,
        data_recebimento: r.data_recebimento,
        cidade: r.cidade,
        data_acao: r.data_acao,
        mes_acao: r.mes_acao,
        valor_solicitado: r.valor_solicitado,
        historico_pedido: r.historico_pedido,
        historico_2025: r.historico_2025,
        contrapartidas: r.contrapartidas,
        parecer_sti: r.parecer_sti,
        parecer_educacao: r.parecer_educacao,
        parecer_final_senai: r.parecer_final_senai,
        parecer_sesi: r.parecer_sesi,
        parecer_fiep: r.parecer_fiep,
        parecer_iel: r.parecer_iel,
        parecer_unisenai: r.parecer_unisenai,
        parecer_label: r.parecer_label,
        valor_oferecido: r.valor_oferecido,
        descricao_evento: (r as any).descricao_evento || null,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateField = async (id: string, field: string, value: string) => {
    const { error } = await supabase
      .from("sponsorship_requests")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const deleteRequest = async (id: string) => {
    const { error } = await supabase
      .from("sponsorship_requests")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return false;
    }

    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Pedido excluído com sucesso" });
    return true;
  };

  const importRequests = async (newRequests: Omit<SponsorshipRequest, "id">[]) => {
    // Check for duplicates by numero_pv
    const existingPVs = requests
      .map((r) => r.numero_pv)
      .filter(Boolean);

    const uniqueNew = newRequests.filter((r) => {
      if (!r.numero_pv) return true;
      return !existingPVs.includes(r.numero_pv);
    });

    const duplicates = newRequests.length - uniqueNew.length;

    if (uniqueNew.length === 0) {
      toast({
        title: "Nenhum pedido novo",
        description: `${duplicates} pedido(s) duplicado(s) ignorado(s) (Nº PV já existente).`,
        variant: "destructive",
      });
      return;
    }

    // Get current max sort_order
    const maxOrder = requests.reduce((max, r) => Math.max(max, (r as any).sort_order || 0), 0);

    const rows = uniqueNew.map((r, idx) => ({
      numero_pv: r.numero_pv || null,
      solicitante: r.solicitante,
      objeto: r.objeto,
      data_recebimento: r.data_recebimento || null,
      cidade: r.cidade || null,
      data_acao: r.data_acao || null,
      mes_acao: r.mes_acao || null,
      valor_solicitado: r.valor_solicitado || null,
      historico_pedido: r.historico_pedido || null,
      historico_2025: r.historico_2025 || null,
      contrapartidas: r.contrapartidas || null,
      parecer_sti: r.parecer_sti || null,
      parecer_educacao: r.parecer_educacao || null,
      parecer_final_senai: r.parecer_final_senai || null,
      parecer_sesi: r.parecer_sesi || null,
      parecer_fiep: r.parecer_fiep || null,
      parecer_iel: r.parecer_iel || null,
      parecer_unisenai: r.parecer_unisenai || null,
      parecer_label: r.parecer_label || "",
      valor_oferecido: r.valor_oferecido || "",
      sort_order: maxOrder + idx + 1,
    }));

    const { error } = await supabase.from("sponsorship_requests").insert(rows);

    if (error) {
      toast({ title: "Erro ao importar", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Importação concluída",
      description: `${uniqueNew.length} pedido(s) importado(s).${duplicates > 0 ? ` ${duplicates} duplicado(s) ignorado(s).` : ""}`,
    });

    fetchRequests();
  };

  return { requests, loading, updateField, deleteRequest, importRequests, refetch: fetchRequests };
}
