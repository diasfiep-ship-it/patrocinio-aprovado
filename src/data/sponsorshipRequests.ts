export interface SponsorshipRequest {
  id: string;
  numero_pv: string | null;
  solicitante: string;
  objeto: string;
  data_recebimento: string | null;
  cidade: string | null;
  data_acao: string | null;
  mes_acao: string | null;
  valor_solicitado: string | null;
  historico_pedido: string | null;
  historico_2025: string | null;
  contrapartidas: string | null;
  parecer_sti: string | null;
  parecer_educacao: string | null;
  parecer_final_senai: string | null;
  parecer_sesi: string | null;
  parecer_fiep: string | null;
  parecer_iel: string | null;
  parecer_unisenai: string | null;
  parecer_label: string | null;
  valor_oferecido: string | null;
}
