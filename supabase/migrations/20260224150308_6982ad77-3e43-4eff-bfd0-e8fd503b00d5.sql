
-- Add sort_order column to preserve spreadsheet order
ALTER TABLE public.sponsorship_requests ADD COLUMN sort_order integer DEFAULT 0;

-- Create attachments table
CREATE TABLE public.request_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.sponsorship_requests(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read attachments" ON public.request_attachments FOR SELECT USING (true);
CREATE POLICY "Public insert attachments" ON public.request_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete attachments" ON public.request_attachments FOR DELETE USING (true);

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('request-files', 'request-files', true);

CREATE POLICY "Public read files" ON storage.objects FOR SELECT USING (bucket_id = 'request-files');
CREATE POLICY "Public upload files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'request-files');
CREATE POLICY "Public delete files" ON storage.objects FOR DELETE USING (bucket_id = 'request-files');
