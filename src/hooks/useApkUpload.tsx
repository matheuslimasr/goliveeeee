import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface ApkFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  version: string | null;
  is_active: boolean;
  created_at: string;
}

export function useApkUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadApk = async (file: File, version: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer upload",
        variant: "destructive"
      });
      return null;
    }

    if (!file.name.endsWith('.apk')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo .apk",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      
      // Simulate progress for better UX since Supabase doesn't provide real progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('apk-files')
        .upload(fileName, file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setProgress(95);

      const { data: urlData } = supabase.storage
        .from('apk-files')
        .getPublicUrl(fileName);

      // Insert record into database
      const { data: apkRecord, error: dbError } = await supabase
        .from('apk_files')
        .insert({
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          version: version || null,
          is_active: false,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setProgress(100);
      
      toast({
        title: "Sucesso!",
        description: "APK enviado com sucesso",
      });

      return apkRecord;
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const setActiveApk = async (apkId: string) => {
    try {
      // First, deactivate all APKs
      await supabase
        .from('apk_files')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Then activate the selected one
      const { error } = await supabase
        .from('apk_files')
        .update({ is_active: true })
        .eq('id', apkId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "APK ativado como download principal",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteApk = async (apkId: string, fileName: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('apk-files')
        .remove([fileName]);

      // Delete from database
      const { error: dbError } = await supabase
        .from('apk_files')
        .delete()
        .eq('id', apkId);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso!",
        description: "APK removido com sucesso",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const getApks = async (): Promise<ApkFile[]> => {
    const { data, error } = await supabase
      .from('apk_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }

    return data || [];
  };

  const getActiveApk = async (): Promise<ApkFile | null> => {
    const { data, error } = await supabase
      .from('apk_files')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) return null;
    return data;
  };

  return {
    uploadApk,
    setActiveApk,
    deleteApk,
    getApks,
    getActiveApk,
    uploading,
    progress
  };
}
