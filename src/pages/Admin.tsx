import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApkUpload } from '@/hooks/useApkUpload';
import { getAnalyticsStats, getDownloadClicksDetails, DownloadClickDetail } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Upload, 
  LogOut, 
  FileBox, 
  Trash2, 
  CheckCircle, 
  Loader2,
  ArrowLeft,
  Download,
  Clock,
  Eye,
  MousePointer,
  Timer,
  TrendingUp,
  RefreshCw,
  Calendar,
  X
} from 'lucide-react';

interface ApkFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  version: string | null;
  is_active: boolean;
  created_at: string;
}

interface AnalyticsStats {
  totalVisits: number;
  downloadClicks: number;
  avgDurationMinutes: number;
  todayVisits: number;
  todayClicks: number;
}

export default function Admin() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { uploadApk, setActiveApk, deleteApk, getApks, uploading, progress } = useApkUpload();
  const navigate = useNavigate();
  
  const [apks, setApks] = useState<ApkFile[]>([]);
  const [version, setVersion] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingApks, setLoadingApks] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [clicksModalOpen, setClicksModalOpen] = useState(false);
  const [clicksDetails, setClicksDetails] = useState<DownloadClickDetail[]>([]);
  const [loadingClicks, setLoadingClicks] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadApks();
      loadStats();
    }
  }, [user]);

  const loadApks = async () => {
    setLoadingApks(true);
    const data = await getApks();
    setApks(data);
    setLoadingApks(false);
  };

  const loadStats = async () => {
    setLoadingStats(true);
    const data = await getAnalyticsStats();
    setStats(data);
    setLoadingStats(false);
  };

  const openClicksModal = async () => {
    setClicksModalOpen(true);
    setLoadingClicks(true);
    const details = await getDownloadClicksDetails();
    setClicksDetails(details);
    setLoadingClicks(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    const result = await uploadApk(selectedFile, version);
    if (result) {
      setSelectedFile(null);
      setVersion('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadApks();
    }
  };

  const handleSetActive = async (apkId: string) => {
    const success = await setActiveApk(apkId);
    if (success) {
      loadApks();
    }
  };

  const handleDelete = async (apkId: string, fileName: string) => {
    const urlParts = fileName.split('/');
    const actualFileName = urlParts[urlParts.length - 1];
    
    const success = await deleteApk(apkId, actualFileName);
    if (success) {
      loadApks();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-30" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Panel Admin</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Analíticas
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadStats}
              disabled={loadingStats}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Visits */}
            <Card className="bg-card/80 backdrop-blur-md border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Visitas Totales</p>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalVisits || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today Visits */}
            <Card className="bg-card/80 backdrop-blur-md border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Visitas Hoy</p>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.todayVisits || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Clicks - Clickable */}
            <Card 
              className="bg-card/80 backdrop-blur-md border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={openClicksModal}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <MousePointer className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Clics Descarga</p>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.downloadClicks || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today Clicks */}
            <Card className="bg-card/80 backdrop-blur-md border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Download className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Clics Hoy</p>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {loadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.todayClicks || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Session Duration */}
            <Card className="bg-card/80 backdrop-blur-md border-border/50 col-span-2 lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Timer className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tiempo Promedio</p>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {loadingStats ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>{stats?.avgDurationMinutes || 0} <span className="text-sm font-normal">min</span></>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-card/80 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Upload className="h-5 w-5 text-primary" />
                Subir APK
              </CardTitle>
              <CardDescription>
                Sube un nuevo archivo APK para publicar en el sitio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="version" className="text-foreground">Versión (opcional)</Label>
                <Input
                  id="version"
                  placeholder="Ej: 1.0.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Archivo APK</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".apk"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <FileBox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  {selectedFile ? (
                    <div>
                      <p className="text-foreground font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-foreground">Haz clic para seleccionar</p>
                      <p className="text-sm text-muted-foreground">Solo archivos .apk</p>
                    </div>
                  )}
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subiendo...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                variant="hero"
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Archivo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* APK List Section */}
          <Card className="bg-card/80 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Download className="h-5 w-5 text-primary" />
                APKs Disponibles
              </CardTitle>
              <CardDescription>
                Gestiona los archivos APK y define cuál estará activo para descarga
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingApks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : apks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileBox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ningún APK subido aún</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {apks.map((apk) => (
                    <div 
                      key={apk.id}
                      className={`p-4 rounded-lg border ${
                        apk.is_active 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-background/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground truncate">
                              {apk.file_name}
                            </p>
                            {apk.is_active && (
                              <Badge variant="default" className="bg-primary text-primary-foreground shrink-0">
                                Activo
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>{formatFileSize(apk.file_size)}</span>
                            {apk.version && <span>v{apk.version}</span>}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(apk.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {!apk.is_active && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetActive(apk.id)}
                              className="gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Activar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(apk.id, apk.file_url)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Download Clicks Details Modal */}
      <Dialog open={clicksModalOpen} onOpenChange={setClicksModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-primary" />
              Detalles de Clics de Descarga
            </DialogTitle>
            <DialogDescription>
              Historial detallado de cada clic en el botón de descarga
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {loadingClicks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : clicksDetails.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay clics registrados aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clicksDetails.map((click, index) => (
                  <div 
                    key={click.id}
                    className="p-4 rounded-lg border border-border bg-card/50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-foreground">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(click.created_at)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Sesión: {click.session_id?.slice(-12) || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                        <Timer className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {click.session_duration_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
