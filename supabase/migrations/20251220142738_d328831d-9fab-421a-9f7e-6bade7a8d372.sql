-- Create table for APK files
CREATE TABLE public.apk_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  version TEXT,
  is_active BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.apk_files ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can insert
CREATE POLICY "Authenticated users can insert APK files"
ON public.apk_files
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

-- Only authenticated users can update their own files
CREATE POLICY "Authenticated users can update APK files"
ON public.apk_files
FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by);

-- Only authenticated users can delete their own files
CREATE POLICY "Authenticated users can delete APK files"
ON public.apk_files
FOR DELETE
TO authenticated
USING (auth.uid() = uploaded_by);

-- Everyone can read active APK (for download button)
CREATE POLICY "Everyone can read active APK"
ON public.apk_files
FOR SELECT
USING (is_active = true);

-- Authenticated users can read all APKs
CREATE POLICY "Authenticated users can read all APKs"
ON public.apk_files
FOR SELECT
TO authenticated
USING (true);

-- Create storage bucket for APK files
INSERT INTO storage.buckets (id, name, public)
VALUES ('apk-files', 'apk-files', true);

-- Storage policies
CREATE POLICY "Anyone can download APK files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'apk-files');

CREATE POLICY "Authenticated users can upload APK files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'apk-files');

CREATE POLICY "Authenticated users can delete APK files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'apk-files');

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_apk_files_updated_at
BEFORE UPDATE ON public.apk_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();