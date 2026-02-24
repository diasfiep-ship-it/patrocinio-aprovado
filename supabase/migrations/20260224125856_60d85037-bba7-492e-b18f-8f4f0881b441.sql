
CREATE TABLE public.sponsorship_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pv TEXT UNIQUE,
  solicitante TEXT NOT NULL,
  objeto TEXT NOT NULL,
  data_recebimento TEXT,
  cidade TEXT,
  data_acao TEXT,
  mes_acao TEXT,
  valor_solicitado TEXT,
  historico_pedido TEXT,
  historico_2025 TEXT,
  contrapartidas TEXT,
  parecer_sti TEXT,
  parecer_educacao TEXT,
  parecer_final_senai TEXT,
  parecer_sesi TEXT,
  parecer_fiep TEXT,
  parecer_iel TEXT,
  parecer_unisenai TEXT,
  parecer_label TEXT DEFAULT '',
  valor_oferecido TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.sponsorship_requests FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.sponsorship_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.sponsorship_requests FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.sponsorship_requests FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sponsorship_requests_updated_at
BEFORE UPDATE ON public.sponsorship_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
